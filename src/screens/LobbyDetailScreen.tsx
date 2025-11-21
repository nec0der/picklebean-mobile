import { memo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Clipboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { X, Copy, Check, User, Users, Radio } from "lucide-react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  RootStackParamList,
  RootStackScreenProps,
} from "@/types/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLobby } from "@/hooks/firestore/useLobby";
import { useLobbyActions } from "@/hooks/actions/useLobbyActions";
import { useToast } from "@/hooks/common/useToast";
import { useNFC } from "@/hooks/common/useNFC";
import { LoadingSpinner, ErrorMessage } from "@/components/common";
import { Card } from "@/components/ui/Card";
import { DraggablePlayerSlot } from "@/components/features/lobby/DraggablePlayerSlot";
import { CountdownOverlay } from "@/components/features/lobby/CountdownOverlay";
import { LobbyHeader } from "@/components/features/lobby/LobbyHeader";
import type { Player } from "@/types/lobby";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { extractUserIdFromNFCUrl } from "@/lib/nfc";

type LobbyDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LobbyDetail"
>;

export const LobbyDetailScreen = memo(
  ({ route }: RootStackScreenProps<"LobbyDetail">) => {
    const { roomCode } = route.params;
    const navigation = useNavigation<LobbyDetailNavigationProp>();
    const { user, userDocument } = useAuth();
    const { lobby, loading, error, exists } = useLobby(roomCode);
    const { joinLobby, leaveLobby, deleteLobby } = useLobbyActions();
    const toast = useToast();
    const insets = useSafeAreaInsets();

      const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [draggedPlayer, setDraggedPlayer] = useState<{
      team: number;
      slot: number;
      player: Player;
    } | null>(null);
    const [draggedCardSize, setDraggedCardSize] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const [slotPositions, setSlotPositions] = useState<
      Record<
        string,
        {
          x: number;
          y: number;
          width: number;
          height: number;
        }
      >
    >({});
    const [activeDropZone, setActiveDropZone] = useState<{
      team: number;
      slot: number;
    } | null>(null);

    // Check if current user is host
    const isHost = user?.id === lobby?.hostId;

    // State for NFC scanning
    const [isScanning, setIsScanning] = useState(false);

    // Initialize NFC
    const {
      isSupported,
      error: nfcError,
      startScanning,
      stopScanning,
    } = useNFC({
      handler: handleNFCTagRead,
      isScanning,
      setIsScanning,
    });

    // Position tracking handler
    const handleSlotLayout = useCallback(
      (
        team: number,
        slot: number,
        layout: { x: number; y: number; width: number; height: number }
      ) => {
        setSlotPositions((prev) => ({
          ...prev,
          [`${team}-${slot}`]: layout,
        }));
      },
      []
    );

    // Calculate which slot the drag is over using AABB intersection
    const calculateDropTarget = useCallback(
      (
        x: number,
        y: number,
        cardWidth: number,
        cardHeight: number
      ): {
        team: number;
        slot: number;
      } | null => {
        console.log("🔍 calculateDropTarget called:", {
          x,
          y,
          cardWidth,
          cardHeight,
        });
        console.log("📦 slotPositions keys:", Object.keys(slotPositions));

        if (!cardWidth || !cardHeight) {
          console.log("❌ No card dimensions!");
          return null;
        }

        // Dragged card bounds (center point is x,y)
        const draggedTop = y - cardHeight / 2;
        const draggedBottom = y + cardHeight / 2;
        const draggedLeft = x - cardWidth / 2;
        const draggedRight = x + cardWidth / 2;

        console.log("📐 Dragged card bounds:", {
          top: draggedTop,
          bottom: draggedBottom,
          left: draggedLeft,
          right: draggedRight,
        });

        for (const [key, pos] of Object.entries(slotPositions)) {
          const [team, slot] = key.split("-").map(Number);

          console.log(`Checking slot ${key}:`, pos);

          // Check if dragged card overlaps with this slot (AABB intersection)
          const verticalOverlap =
            draggedBottom > pos.y && draggedTop < pos.y + pos.height;

          const horizontalOverlap =
            draggedRight > pos.x && draggedLeft < pos.x + pos.width;

          console.log(
            `  Overlaps: vertical=${verticalOverlap}, horizontal=${horizontalOverlap}`
          );

          if (verticalOverlap && horizontalOverlap) {
            console.log(`✅ Found match: team ${team}, slot ${slot}`);
            return { team, slot };
          }
        }

        console.log("❌ No overlapping slot found");
        return null;
      },
      [slotPositions]
    );

    // Drag & drop handlers
    const handleDragStart = useCallback(
      (team: number, slot: number, width: number, height: number) => {
        console.log("🟢 DRAG START:", { team, slot, width, height });
        console.log(
          "📍 slotPositions:",
          JSON.stringify(slotPositions, null, 2)
        );
        if (!lobby) return;
        const player = lobby[`team${team as 1 | 2}`][`player${slot as 1 | 2}`];
        if (player) {
          setDraggedPlayer({ team, slot, player });
          setDraggedCardSize({ width, height });
        }
      },
      [lobby, slotPositions]
    );

    // Update active drop zone during drag
    const handleDragMove = useCallback(
      (x: number, y: number) => {
        console.log("🔵 DRAG MOVE:", { x, y, draggedCardSize });
        if (!draggedCardSize) {
          console.log("❌ No draggedCardSize!");
          return;
        }
        const dropTarget = calculateDropTarget(
          x,
          y,
          draggedCardSize.width,
          draggedCardSize.height
        );
        console.log("🎯 dropTarget:", dropTarget);
        setActiveDropZone(dropTarget);
      },
      [calculateDropTarget, draggedCardSize]
    );

    // Handle drop with calculated position
    const handleDragEnd = useCallback(
      async (x: number, y: number) => {
        if (!draggedPlayer || !lobby || !roomCode || !draggedCardSize) return;

        const dropTarget = calculateDropTarget(
          x,
          y,
          draggedCardSize.width,
          draggedCardSize.height
        );
        setActiveDropZone(null);

        if (!dropTarget) {
          // Dropped outside any slot
          setDraggedPlayer(null);
          return;
        }

        const sourceTeam = draggedPlayer.team;
        const sourceSlot = draggedPlayer.slot;
        const targetTeam = dropTarget.team;
        const targetSlot = dropTarget.slot;

        // Can't drop on same slot
        if (sourceTeam === targetTeam && sourceSlot === targetSlot) {
          setDraggedPlayer(null);
          return;
        }

        try {
          const lobbyRef = doc(firestore, "lobbies", roomCode);
          const targetPlayer =
            lobby[`team${targetTeam as 1 | 2}`][`player${targetSlot as 1 | 2}`];

          // Swap players
          await updateDoc(lobbyRef, {
            [`team${sourceTeam}.player${sourceSlot}`]: targetPlayer || {},
            [`team${targetTeam}.player${targetSlot}`]: draggedPlayer.player,
            lastActivity: new Date(),
          });
        } catch (err) {
          console.error("Error moving player:", err);
          Alert.alert("Error", "Failed to move player");
        } finally {
          setDraggedPlayer(null);
        }
      },
      [draggedPlayer, lobby, roomCode, calculateDropTarget]
    );

    // Check if user is in lobby
    const isInLobby = useCallback(() => {
      if (!lobby || !user) return false;

      return !!(
        lobby.team1.player1?.uid === user.id ||
        lobby.team1.player2?.uid === user.id ||
        lobby.team2.player1?.uid === user.id ||
        lobby.team2.player2?.uid === user.id
      );
    }, [lobby, user]);

    // NFC Tag Handler - Returns false to stop scanning
    async function handleNFCTagRead(url: string): Promise<boolean> {
      console.log("📱 NFC tag detected:", url);

      // Extract user ID from URL
      const scannedUserId = extractUserIdFromNFCUrl(url);

      if (!scannedUserId) {
        toast.error("Invalid NFC tag format");
        return true; // Continue scanning
      }

      // Check if lobby is full
      if (!lobby) return false;

      const capacity = lobby.gameMode === "singles" ? 2 : 4;
      const currentCount = getCurrentPlayerCount();

      if (currentCount >= capacity) {
        toast.error(`Lobby is full (${currentCount}/${capacity} players)`);
        return false; // Stop scanning - lobby is full
      }

      // Check if player already in lobby
      const isPlayerInLobby = !!(
        lobby.team1.player1?.uid === scannedUserId ||
        lobby.team1.player2?.uid === scannedUserId ||
        lobby.team2.player1?.uid === scannedUserId ||
        lobby.team2.player2?.uid === scannedUserId
      );

      if (isPlayerInLobby) {
        toast.info("Player already in lobby");
        return true; // Continue scanning
      }

      try {
        // Fetch scanned user's data
        const userDoc = await getDoc(doc(firestore, "users", scannedUserId));

        if (!userDoc.exists()) {
          toast.error("Player not found");
          return true; // Continue scanning
        }

        const scannedUser = userDoc.data();

        // Prepare player data
        const player: any = {
          uid: scannedUserId,
          displayName: scannedUser.displayName || "Unknown",
        };

        if (scannedUser.profilePictureUrl) {
          player.photoURL = scannedUser.profilePictureUrl;
        }

        // Find first empty slot
        let targetTeam: 1 | 2 = 1;
        let targetSlot: 1 | 2 = 1;

        if (lobby.gameMode === "singles") {
          const hasTeam1 = !!lobby.team1.player1?.uid;
          const hasTeam2 = !!lobby.team2.player1?.uid;

          if (!hasTeam1) {
            targetTeam = 1;
          } else if (!hasTeam2) {
            targetTeam = 2;
          }
          targetSlot = 1;
        } else {
          if (!lobby.team1.player1?.uid) {
            targetTeam = 1;
            targetSlot = 1;
          } else if (!lobby.team1.player2?.uid) {
            targetTeam = 1;
            targetSlot = 2;
          } else if (!lobby.team2.player1?.uid) {
            targetTeam = 2;
            targetSlot = 1;
          } else if (!lobby.team2.player2?.uid) {
            targetTeam = 2;
            targetSlot = 2;
          }
        }

        // Add player to lobby
        const lobbyRef = doc(firestore, "lobbies", roomCode);
        await updateDoc(lobbyRef, {
          [`team${targetTeam}.player${targetSlot}`]: player,
          lastActivity: new Date(),
        });

        toast.success(`${player.displayName} joined the lobby!`);

        // Check if lobby is now full
        const newCount = getCurrentPlayerCount() + 1;
        const isFull = newCount >= capacity;

        return !isFull; // Continue if not full, stop if full
      } catch (error) {
        console.error("Error adding player via NFC:", error);
        toast.error("Failed to add player");
        return true; // Continue scanning even after error
      }
    }

    // Start NFC scanning
    // const handleScanPlayers = useCallback(() => {
    //   console.log("isSupported: ", isSupported);
    //   if (!isSupported) {
    //     toast.error("NFC not supported on this device");
    //     return;
    //   }

    //   setIsScanning(true);
    //   // startScanning(handleNFCTagRead);
    // }, [isSupported, startScanning, toast]);

    const handleScanPlayers = () => {
      console.log("isSupported: ", isSupported);
      if (!isSupported) {
        toast.error("NFC not supported on this device");
        return;
      }

      // Toggle scanning
      if (isScanning) {
        stopScanning();
      } else {
        startScanning();
      }
    };

    // Cleanup NFC on unmount only (not on isScanning changes!)
    useEffect(() => {
      return () => {
        stopScanning();
      };
    }, []); // Don't include isScanning - causes premature cleanup!

    // Auto-join when lobby loads
    useEffect(() => {
      if (!lobby || !user || !userDocument || isJoining || isInLobby()) return;

      const currentCount = getCurrentPlayerCount();
      const capacity = lobby.gameMode === "singles" ? 2 : 4;

      if (currentCount < capacity) {
        handleAutoJoin();
      }
    }, [lobby, user, userDocument]);

    const getCurrentPlayerCount = (): number => {
      if (!lobby) return 0;

      let count = 0;
      if (lobby.team1.player1?.uid) count++;
      if (lobby.team1.player2?.uid) count++;
      if (lobby.team2.player1?.uid) count++;
      if (lobby.team2.player2?.uid) count++;

      return count;
    };

    const handleAutoJoin = async () => {
      if (!user || !userDocument || !lobby) return;

      setIsJoining(true);
      try {
        // Prepare player data - only include photoURL if it exists
        const player: any = {
          uid: user.id,
          displayName: userDocument.displayName || user.email || "Unknown",
        };

        // Only add photoURL if it exists (Firestore doesn't accept undefined)
        if (userDocument.profilePictureUrl) {
          player.photoURL = userDocument.profilePictureUrl;
        }

        // Find first empty slot
        let targetTeam: 1 | 2 = 1;
        let targetSlot: 1 | 2 = 1;

        if (lobby.gameMode === "singles") {
          // Singles: opposing teams
          const hasTeam1 = !!lobby.team1.player1?.uid;
          const hasTeam2 = !!lobby.team2.player1?.uid;

          if (!hasTeam1) {
            targetTeam = 1;
          } else if (!hasTeam2) {
            targetTeam = 2;
          }
          targetSlot = 1;
        } else {
          // Doubles: fill Team 1 first, then Team 2
          if (!lobby.team1.player1?.uid) {
            targetTeam = 1;
            targetSlot = 1;
          } else if (!lobby.team1.player2?.uid) {
            targetTeam = 1;
            targetSlot = 2;
          } else if (!lobby.team2.player1?.uid) {
            targetTeam = 2;
            targetSlot = 1;
          } else if (!lobby.team2.player2?.uid) {
            targetTeam = 2;
            targetSlot = 2;
          }
        }

        const lobbyRef = doc(firestore, "lobbies", roomCode);
        await updateDoc(lobbyRef, {
          [`team${targetTeam}.player${targetSlot}`]: player,
          lastActivity: new Date(),
        });
      } catch (err) {
        console.error("Error auto-joining lobby:", err);
      } finally {
        setIsJoining(false);
      }
    };

    const handleQrPress = () => {
      // TODO: Show QR code modal
      toast.info("QR code feature coming soon!");
    };

    const handleLeave = () => {
      Alert.alert(
        "Leave Lobby?",
        "Are you sure you want to leave this lobby?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              setIsLeaving(true);
              try {
                await leaveLobby(roomCode, user!.id);
                navigation.goBack();
              } catch (err) {
                console.error("Error leaving lobby:", err);
                Alert.alert(
                  "Error",
                  "Failed to leave lobby. Please try again."
                );
              } finally {
                setIsLeaving(false);
              }
            },
          },
        ]
      );
    };

    const handleClose = () => {
      Alert.alert(
        "Close Lobby?",
        "Are you sure you want to close this lobby? All players will be removed.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Close",
            style: "destructive",
            onPress: async () => {
              setIsLeaving(true);
              try {
                await deleteLobby(roomCode);
                navigation.goBack();
              } catch (err) {
                console.error("Error closing lobby:", err);
                Alert.alert(
                  "Error",
                  "Failed to close lobby. Please try again."
                );
              } finally {
                setIsLeaving(false);
              }
            },
          },
        ]
      );
    };

    const handleStartGame = async () => {
      if (!roomCode || !lobby || !canStartGame()) return;

      try {
        const lobbyRef = doc(firestore, "lobbies", roomCode);
        
        // Trigger countdown - start with 1 (first ZERO)
        await updateDoc(lobbyRef, {
          countdownActive: true,
          countdownValue: 1,
          lastActivity: new Date(),
        });
      } catch (err) {
        console.error("Error starting countdown:", err);
        Alert.alert("Error", "Failed to start game. Please try again.");
      }
    };

    // Countdown effect - host manages countdown progression
    useEffect(() => {
      if (!isHost || !lobby?.countdownActive || !lobby?.countdownValue) return;

      console.log('⏱️ Countdown active:', lobby.countdownValue);

      const lobbyRef = doc(firestore, 'lobbies', roomCode);

      if (lobby.countdownValue === 1) {
        // First ZERO - wait 1 second, then show second ZERO
        const timer = setTimeout(async () => {
          try {
            await updateDoc(lobbyRef, {
              countdownValue: 2, // Second ZERO
              lastActivity: new Date(),
            });
          } catch (err) {
            console.error('Error updating countdown:', err);
          }
        }, 1000);

        return () => clearTimeout(timer);
      } else if (lobby.countdownValue === 2) {
        // Second ZERO - wait 1 second, then show START!
        const timer = setTimeout(async () => {
          try {
            await updateDoc(lobbyRef, {
              countdownValue: 'START!',
              lastActivity: new Date(),
            });
          } catch (err) {
            console.error('Error updating countdown:', err);
          }
        }, 1000);

        return () => clearTimeout(timer);
      } else if (lobby.countdownValue === 'START!') {
        // START! - wait 800ms, then start game
        const timer = setTimeout(async () => {
          try {
            await updateDoc(lobbyRef, {
              gameStarted: true,
              gameStartedAt: serverTimestamp(),
              countdownActive: false,
              countdownValue: null,
              lastActivity: new Date(),
            });

            // Navigate to game screen
            navigation.navigate('Game', { roomCode });
          } catch (err) {
            console.error('Error starting game:', err);
          }
        }, 800);

        return () => clearTimeout(timer);
      }
    }, [isHost, lobby?.countdownActive, lobby?.countdownValue, roomCode]);

    const canStartGame = (): boolean => {
      if (!lobby) return false;

      if (lobby.gameMode === "singles") {
        return !!(lobby.team1.player1?.uid && lobby.team2.player1?.uid);
      } else {
        return !!(
          lobby.team1.player1?.uid &&
          lobby.team1.player2?.uid &&
          lobby.team2.player1?.uid &&
          lobby.team2.player2?.uid
        );
      }
    };

    const isRoomFull = (): boolean => {
      if (!lobby) return false;

      const capacity = lobby.gameMode === "singles" ? 2 : 4;
      return getCurrentPlayerCount() >= capacity;
    };

    const isUserInLobby = (): boolean => {
      if (!lobby || !user) return false;

      return !!(
        lobby.team1.player1?.uid === user.id ||
        lobby.team1.player2?.uid === user.id ||
        lobby.team2.player1?.uid === user.id ||
        lobby.team2.player2?.uid === user.id
      );
    };

    // Loading state
    if (loading || isJoining || isLeaving) {
      return (
        <View className="items-center justify-center flex-1 bg-white">
          <LoadingSpinner />
          <Text className="mt-4 text-gray-600">
            {isLeaving
              ? "Leaving lobby..."
              : isJoining
              ? "Joining lobby..."
              : "Loading lobby..."}
          </Text>
        </View>
      );
    }

    // Error state
    if (error || !exists || !lobby) {
      return (
        <View className="flex-1 bg-white">
          <View className="px-4 py-6">
            <ErrorMessage
              message={
                typeof error === "string"
                  ? error
                  : error?.message ||
                    "Lobby not found. It may have been closed."
              }
            />
            <Pressable
              onPress={() => navigation.goBack()}
              className="py-3 mt-4 bg-green-500 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Back to Play
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
          {/* Compact Header */}
          <View className="relative flex-row items-center justify-center px-4 py-3 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Game Lobby</Text>
            <Pressable
              onPress={isHost ? handleClose : handleLeave}
              className="absolute p-2 right-4"
            >
              <X size={24} color="#ef4444" />
            </Pressable>
          </View>

          {/* Lobby Header with Room Code and Actions */}
          {isHost && isSupported && !isRoomFull() && (
            <LobbyHeader
              roomCode={roomCode}
              isScanning={isScanning}
              onQrPress={handleQrPress}
              onScanPress={handleScanPlayers}
            />
          )}
          {(!isHost || !isSupported || isRoomFull()) && (
            <View className="flex-col items-center justify-center px-4 py-3 bg-white border-b border-gray-200">
              <Text className="mb-1 text-xs font-medium tracking-wider text-gray-500">
                ROOM CODE
              </Text>
              <Text className="text-3xl font-bold tracking-widest text-gray-900">
                {roomCode}
              </Text>
            </View>
          )}

          {/* Game Mode Badge - Moved here, right after header */}
          <View className="items-center py-4 border-b border-gray-200 bg-gray-50">
            <View className="flex-row items-center gap-2">
              {lobby.gameMode === "singles" ? (
                <User size={18} color="#6b7280" />
              ) : (
                <Users size={18} color="#6b7280" />
              )}
              <Text className="text-sm font-medium text-gray-600">
                {lobby.gameMode === "singles"
                  ? "Singles (1v1)"
                  : "Doubles (2v2)"}
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1 px-4 py-6"
            contentContainerStyle={{ paddingBottom: isHost ? 100 : 20 }}
          >
            <View className="w-full max-w-md mx-auto space-y-6">
              {/* NFC Not Supported Warning */}
              {isHost && nfcError && (
                <View className="p-3 mb-4 border rounded-lg bg-amber-50 border-amber-200">
                  <Text className="text-sm text-center text-amber-700">
                    📱 {nfcError}
                  </Text>
                </View>
              )}

              {/* Room Full Message */}
              {isRoomFull() && !isUserInLobby() && (
                <View className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <Text className="font-medium text-center text-red-600">
                    Room is full ({getCurrentPlayerCount()}/
                    {lobby.gameMode === "singles" ? 2 : 4})
                  </Text>
                </View>
              )}

              {/* Teams */}
              <View className="space-y-6">
                {/* Team 1 */}
                <Card variant="outlined" padding="lg" className="border-green-200 bg-green-50/30">
                  <Text className="mb-4 text-base font-semibold text-green-700">
                    Team 1
                  </Text>
                  <View className="gap-3">
                    <DraggablePlayerSlot
                      player={lobby.team1.player1}
                      teamNumber={1}
                      slotNumber={1}
                      isHost={isHost}
                      isCurrentUser={lobby.team1.player1?.uid === user?.id}
                      hostId={lobby.hostId}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      onLayout={handleSlotLayout}
                      isHighlighted={
                        activeDropZone?.team === 1 &&
                        activeDropZone?.slot === 1 &&
                        !(
                          draggedPlayer?.team === 1 && draggedPlayer?.slot === 1
                        )
                      }
                    />
                    {lobby.gameMode === "doubles" && (
                      <DraggablePlayerSlot
                        player={lobby.team1.player2}
                        teamNumber={1}
                        slotNumber={2}
                        isHost={isHost}
                        isCurrentUser={lobby.team1.player2?.uid === user?.id}
                        hostId={lobby.hostId}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onLayout={handleSlotLayout}
                        isHighlighted={
                          activeDropZone?.team === 1 &&
                          activeDropZone?.slot === 2 &&
                          !(
                            draggedPlayer?.team === 1 &&
                            draggedPlayer?.slot === 2
                          )
                        }
                      />
                    )}
                  </View>
                </Card>

                {/* VS Divider - Minimalist */}
                <View className="flex-row items-center justify-center py-3">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="px-3 text-sm font-medium text-gray-500">
                    vs
                  </Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Team 2 */}
                <Card variant="outlined" padding="lg" className="border-blue-200 bg-blue-50/30">
                  <Text className="mb-4 text-base font-semibold text-blue-700">
                    Team 2
                  </Text>
                  <View className="gap-3">
                    <DraggablePlayerSlot
                      player={lobby.team2.player1}
                      teamNumber={2}
                      slotNumber={1}
                      isHost={isHost}
                      isCurrentUser={lobby.team2.player1?.uid === user?.id}
                      hostId={lobby.hostId}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      onLayout={handleSlotLayout}
                      isHighlighted={
                        activeDropZone?.team === 2 &&
                        activeDropZone?.slot === 1 &&
                        !(
                          draggedPlayer?.team === 2 && draggedPlayer?.slot === 1
                        )
                      }
                    />
                    {lobby.gameMode === "doubles" && (
                      <DraggablePlayerSlot
                        player={lobby.team2.player2}
                        teamNumber={2}
                        slotNumber={2}
                        isHost={isHost}
                        isCurrentUser={lobby.team2.player2?.uid === user?.id}
                        hostId={lobby.hostId}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onLayout={handleSlotLayout}
                        isHighlighted={
                          activeDropZone?.team === 2 &&
                          activeDropZone?.slot === 2 &&
                          !(
                            draggedPlayer?.team === 2 &&
                            draggedPlayer?.slot === 2
                          )
                        }
                      />
                    )}
                  </View>
                </Card>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Start Game Button (Host Only) */}
          {isHost && (
            <View 
              className="absolute bottom-0 left-0 right-0 px-4 pt-4 bg-white border-t border-gray-200"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <Pressable
                onPress={handleStartGame}
                disabled={!canStartGame()}
                className={`py-4 rounded-xl items-center ${
                  canStartGame()
                    ? "bg-green-500 active:bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                <Text className="text-lg font-bold text-white">Start Game</Text>
              </Pressable>
            </View>
          )}

          {/* Countdown Overlay - Shows for all players */}
          <CountdownOverlay
            visible={!!lobby.countdownActive}
            value={lobby.countdownValue || null}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }
);
LobbyDetailScreen.displayName = "LobbyDetailScreen";
