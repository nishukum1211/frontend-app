import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { getLoginJwtToken } from "../auth/auth";
import { getFileName } from "../utils/fileSystem";

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
  const tokenSource = role === "user" ? "firebase" : "password";

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

/**
 * Downloads an image from the backend and stores it locally.
 * @param userId The user ID.
 * @param imageId The image ID (message ID).
 * @param role The role of the current user ("user" or "agent").
 * @returns The local file URI or null if download fails.
 */
export async function downloadChatImageToLocal(
    userId: string,
  messageId: string,
  imageName: string
): Promise<string | null> {
  try {
    // Construct backend URL
    const backendUrl = `https://dev-backend-py-23809827867.us-east1.run.app/chat/image/${userId}/${messageId}/${imageName}`;

    // 1. Create a directory for chat images if it doesn't exist
    const chatImagesDir = new Directory(Paths.cache, `chat/${userId}`);
    await chatImagesDir.create({ intermediates: true, idempotent: true });

    // 2. Download the file into that directory
    // The download function doesn't support headers, so the URL must be public or pre-signed.
    // Assuming the image URL is accessible without auth headers for this to work.
    const downloadedFile = await File.downloadFileAsync(
      backendUrl,
      chatImagesDir,
      {idempotent: true}
    );

    // 3. Return the local URI from the downloaded file
    return downloadedFile.uri;
  } catch (error) {
    console.error("Error downloading chat image:", error);
    return null;
  }
}