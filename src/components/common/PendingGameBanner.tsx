import { memo, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import type { PendingGame } from "@/hooks/firestore/usePendingGame";
import { AlertCircle } from "lucide-react-native";

interface PendingGameBannerProps {
  pendingGame: PendingGame;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PendingGameBanner = memo(
  ({ pendingGame }: PendingGameBannerProps) => {
    const navigation = useNavigation<NavigationProp>();

    const handleReturn = useCallback(() => {
      // Smart navigation: Go to Game if active, Lobby if waiting
      if (pendingGame.type === "game") {
        navigation.navigate("Game", { roomCode: pendingGame.roomCode });
      } else {
        navigation.navigate("LobbyDetail", { roomCode: pendingGame.roomCode });
      }
    }, [navigation, pendingGame.type, pendingGame.roomCode]);

    return (
      <View className="p-4 mb-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
        <View className="flex-row items-start gap-2">
          <View className="flex-1 gap-2">
            <View className="flex-row items-start gap-2">
              <AlertCircle size={20} color="#f59e0b" className="mt-0.5 mr-2" />
              <Text className="mb-1 text-base font-semibold !text-yellow-900">
                Active {pendingGame.type === "game" ? "Game" : "Lobby"}
              </Text>
            </View>
            <Text className="mb-3 text-sm !text-yellow-800">
              You have an active{" "}
              {pendingGame.type === "game" ? "game" : "lobby"}. Complete or
              leave it to start a new one.
            </Text>
            <Pressable
              onPress={handleReturn}
              className="justify-center px-4 py-2 bg-yellow-500 rounded-lg active:bg-yellow-600"
            >
              <Text className="font-semibold text-center !text-white">
                Resume Game
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
);

PendingGameBanner.displayName = "PendingGameBanner";
