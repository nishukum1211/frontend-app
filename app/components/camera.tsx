import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getUserData } from "../../app/auth/action";
import { pickImageFromCamera } from "./imagePicker"; // Corrected import path

interface CameraScreenProps {
  handleClose: () => void;
  onPictureTaken: (uri: string) => void;
}

export default function CameraScreen({ handleClose, onPictureTaken }: CameraScreenProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndLaunchCamera = async () => {
      console.log("CameraScreen: Checking authentication status...");
      try {
        const user = await getUserData();
        if (!user) {
          console.log("CameraScreen: User not logged in. Redirecting to /profile.");
          setIsCheckingAuth(false); // Stop showing activity indicator
          router.replace("/(tabs)/profile");
          return;
        }

        console.log("CameraScreen: User logged in. Proceeding to launch camera.");
        setIsCheckingAuth(false);
        const imageUri = await pickImageFromCamera();
        if (imageUri) {
          onPictureTaken(imageUri);
        } else {
          handleClose();
        }
      } catch (error) {
        console.error("CameraScreen: Error during authentication check:", error);
        // Optionally, redirect to an error page or login page on auth check failure
        setIsCheckingAuth(false); // Stop showing activity indicator
        router.replace("/(tabs)/profile");
      }
    };
    void checkAuthAndLaunchCamera();
  }, [handleClose, onPictureTaken, router]);

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If not checking auth and user is logged in, the camera launch is handled by useEffect.
  // This component doesn't need to render anything visible after the check,
  // as the native camera app typically takes over the UI.
  return null;
}




