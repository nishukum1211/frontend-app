import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { pickImageFromCamera } from "../components/imagePicker";

export default function CameraScreen() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const launchCamera = async () => {
        const imageUri = await pickImageFromCamera();

        if (imageUri) {
          // Navigate to the chat tab and pass the image URI as a parameter
          router.push({
            pathname: "/(tabs)/chat",
            params: { image_uri: imageUri },
          });
        } else {
          // If user cancels, go back to the home screen
          router.replace("/(tabs)");
        }
        // The return function is not strictly needed here as we are replacing the screen,
        // but it's good practice for cleanup if the logic changes.
      };
      void launchCamera();
    }, [router])
  );

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
