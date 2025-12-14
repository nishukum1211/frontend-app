import * as Notifications from "expo-notifications";
import { Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { IMessage } from "react-native-gifted-chat";
import { updateChat } from "../chat/chatCache";
import { AppEvents } from "./eventEmitter";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationHandler = () => {
  const router = useRouter();
  const [isUpdatingChat, setIsUpdatingChat] = useState(false);

  const handleChatMessage = async (data: any) => {
    if (data?.type === "chat-message" && data.chatId && data.messageData) {
      const message: IMessage = data.messageData as any;
      const chatId = data.chatId as string;
      const role = data.recipientRole as "user" | "agent";

      setIsUpdatingChat(true);
      try {
        await updateChat(chatId, message, role);
      } catch (err) {
        console.error("Failed to update chat:", err);
      } finally {
        setIsUpdatingChat(false);
      }
    }
  };

  useEffect(() => {
    // Foreground notification
    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const data = notification.request.content.data;
        console.log("Notification received:", data);

        // Update chat in the background when a chat message is received
        await handleChatMessage(data);

        if (AppState.currentState === "active") {
          if (data?.action === "refresh" && data?.target && typeof data.target === "string" && data?.type !== "chat-message") {
            AppEvents.emit("refresh-screen", data.target);
          }
        }
      });

    // Notification tap (user interaction)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          console.log("Notification tapped:", data);

          // Emit refresh if needed
          if (data?.action === "refresh" && data?.target && typeof data.target === "string") {
            AppEvents.emit("refresh-screen", data.target);
          }

          // Redirect if href exists
          if (data?.href && typeof data.href === "string") {
            router.push(data.href as Href);
          } else {
            console.warn(
              "Tapped notification but no valid href found",
              data
            );
          }
        }
      );

    return () => {
      notificationReceivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [router]);

  return { isUpdatingChat };
};
