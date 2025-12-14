import { Directory, File, Paths } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { getFileName } from "../utils/fileSystem";
import { updateMessageImageUri } from "./chatCache";

interface CachedImageProps {
  remoteUri: string;
  messageId: string;
  onPress: (uri: string) => void;
  chatId: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  remoteUri,
  messageId,
  onPress,
  chatId,
}) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const filename = getFileName(remoteUri);
  const backendUrl = `https://dev-backend-py-23809827867.us-east1.run.app/chat/image/${chatId}/${messageId}/${filename}`;


  useEffect(() => {
    if (!remoteUri) return;

    const loadImage = async () => {
      const chatImagesDir = new Directory(Paths.cache, `chat/${chatId}`);
      await chatImagesDir.create({ intermediates: true, idempotent: true });

      const baseName = stripExt(filename);

      const candidates = [
        new File(chatImagesDir, `${baseName}.png`),
        new File(chatImagesDir, `${baseName}.jpg`),
        new File(chatImagesDir, `${baseName}.jpeg`),
      ];

      for (const file of candidates) {
        if (file.exists) {
          setLocalUri(file.uri);
          return;
        }
      }

      setLocalUri(null);
    };

    loadImage();
  }, [remoteUri, chatId]);

  const handlePress = async () => {
    if (localUri) {
      onPress(localUri);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const chatImagesDir = new Directory(Paths.cache, `chat/${chatId}`);
      await chatImagesDir.create({ intermediates: true, idempotent: true });

      const downloadedFile = await File.downloadFileAsync(
        backendUrl,
        chatImagesDir,
        { idempotent: true }
      );
      setLocalUri(downloadedFile.uri);
      await updateMessageImageUri(chatId, messageId, downloadedFile.uri);
      onPress(downloadedFile.uri);
    } catch (e) {
      console.error("Failed to download image:", e);
      onPress(remoteUri);
    } finally {
      setIsLoading(false);
    }
  };

  const imageUri = localUri || remoteUri;

  return (
    <View style={{ padding: 2, borderRadius: 8 }}>
      <TouchableOpacity onPress={handlePress}>
        <Image
          source={{ uri: imageUri }}
          style={{
            width: 200,
            height: 150,
            borderRadius: 8,
            backgroundColor: "#eee",
          }}
          resizeMode="cover"
        />

        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

function stripExt(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

export default CachedImage;
