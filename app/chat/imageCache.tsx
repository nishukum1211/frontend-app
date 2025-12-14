import { Directory, File, Paths } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, TouchableOpacity, View } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { getLoginJwtToken } from "../auth/auth";
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

/**
 * Uploads an image from an IMessage to the backend if present.
 * @param message The IMessage object.
 * @param userId The user ID (sender or receiver).
 * @param role The role of the current user ("user" or "agent").
 * @returns The backend image URL or null if no image.
 */
export async function processChatImageMessage(
  message: IMessage,
  chatId: string,
  role: "user" | "agent" = "agent"
): Promise<void> {
  if (!message.image) return;

  const token = await getLoginJwtToken();
  if (!token) throw new Error("No auth token found");

  // Extract file info
  const uri = message.image;
  const filename = getFileName(uri);
  const type = filename.endsWith(".png") ? "image/png" : "image/jpeg";

  // Prepare form data
  const formData = new FormData();
  formData.append("image", {
    uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
    name: filename,
    type,
  } as any);

  // Use message._id as the chat message id
  const url = `https://dev-backend-py-23809827867.us-east1.run.app/chat/image/${chatId}/${message._id}`;

  // Set X-Token-Source based on role
  const tokenSource = role === "user" ? "otp" : "password";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Token-Source": tokenSource,
      // 'Content-Type' should NOT be set for FormData in React Native
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image upload failed: ${errorText}`);
  }
}

export default CachedImage;
