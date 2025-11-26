import { useState } from "react";
import { View, TouchableOpacity, SafeAreaView } from "react-native";
import {
  Box,
  Heading,
  VStack,
  Text,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  Center,
} from "@gluestack-ui/themed";
import { ChevronLeft, Mars, Venus, Check } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import type { AuthStackScreenProps } from "@/types/navigation";

type SelectGenderScreenProps = AuthStackScreenProps<"SelectGender">;

export const SelectGenderScreen = ({
  navigation,
  route,
}: SelectGenderScreenProps) => {
  const { username, password } = route.params;
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [showInfo, setShowInfo] = useState(false);

  const infoContent = [
    "Organize rankings into Men's and Women's categories",
    "Create fair competition",
    "Required for leaderboard placement",
    "You can update this later if needed",
  ];

  const handleNext = () => {
    if (selectedGender) {
      navigation.navigate("UploadPhoto", {
        username,
        password,
        gender: selectedGender,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 px-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="self-start p-2 -ml-2"
        >
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>

        {/* Header */}
        <VStack space="sm" className="mt-6">
          <Heading size="2xl" className="text-gray-900">
            Select Gender
          </Heading>
          <View className="flex-row flex-wrap items-center gap-1">
            <Text size="md" className="text-gray-600">
              This helps us organize fair competition and rankings.{" "}
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(true)}>
              <Text size="md" className="!text-blue-600">
                Why is this needed?
              </Text>
            </TouchableOpacity>
          </View>
        </VStack>

        {/* Gender Selection Buttons */}
        <VStack space="md" className="mt-8">
          {/* Male Button */}
          <TouchableOpacity
            onPress={() => setSelectedGender("male")}
            className={`rounded-xl border-2 p-4 ${
              selectedGender === "male"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Mars
                  size={24}
                  color="#2563EB"
                />
                <Text
                  className={`ml-3 text-lg font-semibold ${
                    selectedGender === "male"
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  Male
                </Text>
              </View>
              {selectedGender === "male" && (
                <View className="items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Female Button */}
          <TouchableOpacity
            onPress={() => setSelectedGender("female")}
            className={`rounded-xl border-2 p-4 ${
              selectedGender === "female"
                ? "border-pink-600 bg-pink-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Venus
                  size={24}
                  color="#DB2777"
                />
                <Text
                  className={`ml-3 text-lg font-semibold ${
                    selectedGender === "female"
                      ? "text-pink-600"
                      : "text-gray-900"
                  }`}
                >
                  Female
                </Text>
              </View>
              {selectedGender === "female" && (
                <View className="items-center justify-center w-6 h-6 bg-pink-600 rounded-full">
                  <Check size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </VStack>

        {/* Next Button */}
        <View className="pb-8 mt-8">
          <Button
            title="Next"
            size="md"
            onPress={handleNext}
            disabled={!selectedGender}
            fullWidth
          />
        </View>
      </Box>

      {/* Info Actionsheet */}
      <Actionsheet 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)}
        snapPoints={[80]}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-6 pt-4 pb-12">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <Heading size="xl" className="mt-4 mb-6 text-gray-900">
            Gender Selection
          </Heading>

          <VStack space="md">
              {infoContent.map((item, index) => (
                <View key={index} className="flex-row gap-2 px-2">
                  <Text size="md" className="text-gray-600">
                    •
                  </Text>
                  <Text size="md" className="text-gray-600">
                    {item}
                  </Text>
                </View>
              ))}

          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
};
