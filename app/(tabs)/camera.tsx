import CameraScreen from "../components/camera";
import { useRouter } from "expo-router";

export default function CameraTabPage() {
  const router = useRouter();

  const handlePictureTaken = (uri: string) => {
    router.push({
      pathname: "/(tabs)/chat",
      params: { image_uri: uri },
    });
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CameraScreen onPictureTaken={handlePictureTaken} handleClose={handleClose} />
  );
}
