# Messaging System

## Overview

The messaging system provides real-time chat functionality between users, supporting:
- Individual (1-on-1) chats
- Group chats
- Text messages
- Image attachments (camera & photo library)
- Location sharing

## Message Types

### Text Messages
Standard text-based messages with support for up to 2000 characters.

### Image Messages
Users can share images via:
- **Camera**: Take a new photo
- **Photo Library**: Select from existing photos

Images are uploaded to Firebase Storage (`chat-images/{chatId}/`) and the URL is stored in the message.

### Location Messages
Users can share their current location with:
- Latitude/longitude coordinates
- Reverse-geocoded address (when available)
- Tap-to-open functionality (opens native Maps app)

## Components

### AttachmentPickerSheet
Bottom sheet component that presents attachment options:
- Camera (requires camera permission)
- Photos (requires photo library permission)
- Location (requires location permission)

### ChatDetailScreen
Main conversation view that:
- Displays message bubbles (text, image, location)
- Shows upload progress for images
- Handles draft mode for new conversations
- Supports keyboard avoidance

## Data Model

### Message
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'text' | 'image' | 'location';
  image?: {
    url: string;
    width: number;
    height: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: Timestamp;
  readBy: string[];
}
```

## Firebase Storage Rules

Chat images are stored in `chat-images/{chatId}/{fileName}` with:
- Max file size: 10MB
- Allowed types: image/*
- Read: Authenticated users
- Write: Authenticated users

## Usage

### Sending an Image
1. Tap the `+` button in the message input bar
2. Select "Camera" or "Photos"
3. Grant necessary permissions
4. Capture/select image
5. Image uploads automatically and message is sent

### Sharing Location
1. Tap the `+` button in the message input bar
2. Select "Location"
3. Grant location permission
4. Current location is captured and sent

### Viewing Attachments
- **Images**: Displayed inline with proper aspect ratio
- **Locations**: Shows address preview, tap to open in Maps app

---

## Original Specification

## Overview

The messaging feature enables users to communicate through individual and group chats. Available in Gravity mode as a tab between Map and Profile.

## Features

### Implemented
- ✅ **Chat List Screen** - Shows all conversations with search, unread badges, and swipe-to-delete
- ✅ **Telegram-style Search** - Filters existing chats, shows recent searches when empty
- ✅ **Chat Detail Screen** - Full conversation view with message bubbles
- ✅ **Unread Badge** - Shows count on tab icon (red badge)
- ✅ **Message Previews** - Truncated last message in list
- ✅ **Swipe Actions** - Swipe left to "delete" (hide) chat
- ✅ **Recent Searches** - Stored in AsyncStorage
- ✅ **Real-time Updates** - Firestore listeners for chats and messages

### Future Enhancements
- 🔜 **New Chat Flow** - User picker to start new conversations
- 🔜 **Typing Indicators** - "John is typing..." (medium difficulty)
- 🔜 **Image Messages** - Send photos
- 🔜 **Push Notifications** - Background message alerts
- 🔜 **Message Reactions** - Like/react to messages

## Architecture

### Files Structure

```
src/
├── types/
│   └── chat.ts                    # Chat & Message types
├── screens/
│   ├── ChatsScreen.tsx            # Main chat list tab
│   └── ChatDetailScreen.tsx       # Individual conversation
├── components/
│   └── chat/
│       ├── ChatListItem.tsx       # Chat row component
│       └── ChatSearchBar.tsx      # Telegram-style search
├── services/
│   └── chatService.ts             # Firestore operations
├── hooks/
│   ├── firestore/
│   │   ├── useChats.ts            # Real-time chat list
│   │   └── useMessages.ts         # Messages for a chat
│   └── common/
│       └── useRecentSearches.ts   # AsyncStorage hook
└── lib/
    └── recentSearches.ts          # Storage helpers
```

### Firestore Schema

```
chats/
  {chatId}/
    type: 'individual' | 'group'
    name: string | null              # Only for group chats
    participantIds: string[]
    participantInfo: { 
      [userId]: { 
        userId: string
        username: string
        displayName: string
        photoURL: string | null 
      } 
    }
    lastMessage: { 
      text: string
      senderId: string
      senderName: string
      timestamp: Timestamp 
    } | null
    unreadCount: { [userId]: number }
    deletedFor: string[]             # User IDs who "deleted" this chat
    createdAt: Timestamp
    updatedAt: Timestamp
    
    messages/ (subcollection)
      {messageId}/
        senderId: string
        senderName: string
        text: string
        createdAt: Timestamp
        readBy: string[]
```

### Security Rules

```javascript
// Only participants can read/write to chats
match /chats/{chatId} {
  allow read: if auth.uid in resource.data.participantIds;
  allow create: if auth.uid in request.resource.data.participantIds;
  allow update: if auth.uid in resource.data.participantIds;
  
  // Messages subcollection
  match /messages/{messageId} {
    allow read: if auth.uid in chat.participantIds;
    allow create: if auth.uid in chat.participantIds 
                   && request.resource.data.senderId == auth.uid;
  }
}
```

## Navigation

### Tab Position (Gravity Mode)
- Map | **Chats** | Profile

### Screen Routes
- `Chats` - Tab screen showing chat list
- `ChatDetail` - Stack screen for conversation (params: `{ chatId: string }`)

## Key Behaviors

### Soft Delete
- Swiping left shows "Delete" action
- "Delete" adds user to `deletedFor` array (hides chat)
- If new message arrives, chat reappears (deletedFor is cleared)

### Unread Count
- Badge shows total unread across all chats
- Opens chat → marks as read
- Real-time updates via Firestore listeners

### Search
1. **Empty search**: Shows recent searches
2. **Typing**: Filters existing chats by name/username/message content
3. **Select result**: Navigates to chat & adds to recent searches

## Usage Examples

### Starting a Chat (Future)
```typescript
import { getOrCreateIndividualChat } from '@/services/chatService';

const chatId = await getOrCreateIndividualChat(
  { userId: 'current-user-id', username: 'me', displayName: 'Me', photoURL: null },
  { userId: 'other-user-id', username: 'friend', displayName: 'Friend', photoURL: '...' }
);

navigation.navigate('ChatDetail', { chatId });
```

### Creating a Group Chat
```typescript
import { createGroupChat } from '@/services/chatService';

const chatId = await createGroupChat('Game Night Crew', [
  { userId: 'user1', ... },
  { userId: 'user2', ... },
  { userId: 'user3', ... },
]);
```

### Sending a Message
```typescript
import { sendMessage } from '@/services/chatService';

await sendMessage({
  chatId: 'chat-id',
  senderId: 'user-id',
  senderName: 'Display Name',
  text: 'Hello!',
});
```

## Performance Considerations

1. **Message Pagination**: Limited to 50 messages per load
2. **Chat List Limit**: Shows max 50 chats
3. **Real-time Listeners**: Auto-unsubscribe on unmount
4. **Memoization**: Components use React.memo for optimization

## Testing Checklist

- [ ] Create individual chat between two users
- [ ] Send and receive messages in real-time
- [ ] Verify unread badge updates
- [ ] Test swipe-to-delete functionality
- [ ] Verify search filters chats correctly
- [ ] Test recent searches persistence
- [ ] Check keyboard behavior on chat detail
- [ ] Verify message timestamps display correctly
