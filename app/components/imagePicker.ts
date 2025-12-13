import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const pickImageFromCamera = async (): Promise<string | null> => {
  const permissionResult =
    await ImagePicker.requestCameraPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert(
      "Permission required",
      "You need to allow camera access to send photos."
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
  });

  if (!result.canceled) return result.assets[0].uri;
  return null;
};
