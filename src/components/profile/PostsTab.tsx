import { memo } from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

export const PostsTab = memo(() => {
  return (
    <View className="items-center justify-center flex-1 px-4 py-12">
      <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
        <MessageCircle size={32} color="#9ca3af" />
      </View>
      
      <Text className="mb-2 text-lg font-bold !text-gray-900">
        No posts yet
      </Text>
      
      <Text className="text-sm text-center !text-gray-500">
        Share your pickleball moments coming soon!
      </Text>
    </View>
  );
});

PostsTab.displayName = 'PostsTab';
