import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { pickImageFromCamera } from "../components/imagePicker";

interface CameraScreenProps {
  handleClose: () => void;
  onPictureTaken: (uri: string) => void;
}

export default function CameraScreen({ handleClose, onPictureTaken }: CameraScreenProps) {
  useEffect(() => {
    const launchCamera = async () => {
      const imageUri = await pickImageFromCamera();
      if (imageUri) {
        onPictureTaken(imageUri);
      } else {
        handleClose();
      }
    };
    void launchCamera();
  }, [handleClose, onPictureTaken]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
