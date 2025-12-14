import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Removed unused `Dimensions` import
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getUserData } from "../auth/action";
import { DecodedToken, removeUserData } from "../auth/auth";
import { fetchAllChatsAndCache, loadAgentChatListFromCache, loadAllChatsFromCache, updateChat } from "../chat/chatCache";
import { webSocketManager } from "../chat/websocketOps";
import { CallRequest as CallRequestType } from "../components/CallRequestWidget";
import ChatView from "../components/ChatView";

const { width } = Dimensions.get("window");

type AgentChatItem = {
  id: string;
  userName: string;
  lastMessage: string;
};

// Hardcoded for demonstration. In a real app, this would come from an API or selection.
const SUPPORT_AGENT_ID = "ecc71288-6403-48ed-8058-dad2a6dc8c76"; 

export default function Chat() {
  const router = useRouter();
  const { callRequest, image_uri } = useLocalSearchParams();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [agentChats, setAgentChats] = useState<AgentChatItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    // This effect runs when the screen comes into focus
    useCallback(() => {
      const checkAuthStatus = async () => {
        setLoading(true);
        const storedUser = await getUserData();

        if (storedUser) {
          if (storedUser.exp && storedUser.exp * 1000 < Date.now()) {
            await removeUserData();
            setUser(null);
            router.replace("/(tabs)/profile");
          } else {
            setUser(storedUser);
          }
        } else {
          router.replace("/(tabs)/profile");
        }
        setLoading(false); // Set loading to false after auth check
      };

      void checkAuthStatus();
    }, [router])
  );

  const loadAgentChats = useCallback(async (forceRefresh = false) => {
    if (user?.role !== "agent") return;

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    await fetchAllChatsAndCache("agent", forceRefresh);
    const updatedChats = await loadAgentChatListFromCache();
    if (updatedChats) {
      setAgentChats(updatedChats);
    }

    setLoading(false);
    setIsRefreshing(false);
  }, [user?.role]);

  // Fetch agent chats when user is an agent
  useEffect(() => {
    loadAgentChats(false);
  }, [user, loadAgentChats]); // Re-fetch if the user object changes

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (!user) {
        console.error("User not available");
        return;
      }

      // Wait for connection if not already connected
      if (!webSocketManager.isConnected()) {
        setConnectionStatus("Reconnecting...");
        const connected = await new Promise<boolean>((resolve) => {
          webSocketManager.connect(
            { userId: user.id, agentId: SUPPORT_AGENT_ID, role: "user" },
            {
              onOpen: () => {
                setConnectionStatus("Connected");
                resolve(true);
              },
              onError: (error) => {
                console.log("WebSocket Error:", error);
                resolve(false);
              },
              onClose: () => setConnectionStatus("Disconnected"),
            }
          );
        });
        if (!connected) {
          console.error("Failed to connect WebSocket. Message not sent.");
          return;
        }
      }

      const sentMessage = messages[0];

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      // Call updateChat for sent message
      // console.log("Updating chat cache on send:", JSON.stringify(sentMessage, null, 2));
      updateChat(user.id, sentMessage, "user").catch(error => {
        console.error("Failed to update chat cache on send:", error);
      });

      // The webSocketManager's sendChat expects an IMessage object.
      // It will handle the JSON stringification.
      const messageToSend: IMessage = {
        ...sentMessage,
        user: {
          _id: user.id,
          name: user.name,
        },
      };
      // console.log("Sending message via WebSocket:", JSON.stringify(messageToSend, null, 2));
      webSocketManager.sendChat(messageToSend);
    },
    [user]
  );

  useEffect(() => {
    if (!user || user.role === "agent") return; // Only connect if it's a regular user
    
    // Load cached messages for the user
    const loadCachedMessages = async () => {
      const { getLoginJwtToken } = require("../auth/auth");
      try {
        const token = await getLoginJwtToken();
        if (token) {
          await fetchAllChatsAndCache("user");
        }
        const allChats = await loadAllChatsFromCache();
        if (allChats && allChats[user.id]) {
          const userChat = allChats[user.id];
          if (userChat.all && userChat.all.length > 0) {
            const sortedMessages = [...userChat.all].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setMessages(sortedMessages);
          }
        }
      } catch (error) {
        console.error("Failed to load cached messages for user:", error);
      }
    };
    loadCachedMessages();

    // Connect WebSocket using the manager
    webSocketManager.connect(
      { userId: user.id, agentId: SUPPORT_AGENT_ID, role: "user" },
      {
        onOpen: () => {
          setConnectionStatus("Connected");
        },
        onMessage: (event) => {
          // console.log("Received message:", event.data);
          // You can handle incoming messages here if needed in the future
        },
        onError: (error) => {
          console.log("WebSocket Error:", error);
        },
        onClose: (event) => {
          console.log("WebSocket Disconnected:", event.code, event.reason);
          setConnectionStatus("Disconnected");
        },
      }
    );

    // The webSocketManager handles persistent connection, but if you want to
    // disconnect when the user navigates away from the entire app/logs out,
    // that logic is handled elsewhere (e.g., on logout).
    // For screen-specific cleanup, you can use the return function.
    return () => {
      // Disconnect if leaving the chat tab. The manager will auto-reconnect
      // when the user comes back if the connection is needed.
      // webSocketManager.disconnect(); // Optional: uncomment if you want to disconnect on tab change
    };
  }, [user, router]); // Reconnect if user changes.

  // Separate effect to handle sending a call request
  useEffect(() => {
    if (callRequest && user) {
      try {
        const callRequestData: CallRequestType = JSON.parse(callRequest as string);
        const newMessage: IMessage = {
          _id: callRequestData.id,
          text: '📞', // Text is empty because the widget will be shown
          createdAt: new Date(),
          user: { _id: user.id, name: user.name },
          type: 'call-request', // Set the custom type
          data: callRequestData, // Attach custom data to the 'data' property
        };
        onSend([newMessage]); // Programmatically send the message
        router.setParams({ callRequest: undefined }); // Clear the param
      } catch (e) {
        console.error("Failed to parse callRequest parameter:", e);
      }
    }
  }, [callRequest, user, onSend, router]);

  // Separate effect to handle sending an image from the camera tab
  useEffect(() => {
    if (image_uri && user) {
      // console.log("Received image_uri:", image_uri);
      const newMessage: IMessage = {
        _id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        user: {
          _id: user.id,
          name: user.name,
        },
        image: image_uri as string,
        text: "📷",
      };
      // console.log("Creating IMessage object for image:", JSON.stringify(newMessage, null, 2));
      onSend([newMessage]); // Programmatically send the message
      // Clear the param so it doesn't re-send on focus
      router.setParams({ image_uri: undefined });
    }
  }, [image_uri, user, onSend, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Agent View
  if (user?.role === "agent") {
    return (
      <View style={styles.agentContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.header}>Conversations</Text>
          <TouchableOpacity onPress={() => loadAgentChats(true)} style={styles.refreshButton} disabled={isRefreshing}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={28} color="#4F46E5" />
            )}
          </TouchableOpacity>
        </View>
        <FlatList
          data={agentChats}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadAgentChats(true)} colors={["#4F46E5"]} />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/chat/agentChatDetail",
                  params: {
                    id: item.id,
                    userName: item.userName,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <View style={[styles.avatar, styles.textAvatarBackground]}>
                <Text style={styles.textAvatar}>
                  {item.userName ? item.userName.substring(0, 2).toUpperCase() : ""}
                </Text>
              </View>
              <View style={styles.chatContent}>
                <Text style={styles.userName}>
                  {item.userName}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={2}>
                  {item.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Regular User View
  return user ? (
    <View style={{ flex: 1 }}>
      <View
        style={[
          styles.statusBar,
          connectionStatus === "Connected"
            ? styles.connected
            : styles.disconnected,
        ]}
      >
        <Text style={styles.statusText}>{connectionStatus}</Text>
      </View>
      <ChatView
        messages={messages}
        onSend={onSend}
        chatId={user.id}
        user={{
          _id: user.id,
          name: user.name,
        }}
      />
    </View>
  ) : null;
}


const styles = StyleSheet.create({
  statusBar: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  connected: {
    backgroundColor: "#4CAF50", // Green for connected
  },
  disconnected: {
    backgroundColor: "#F44336", // Red for disconnected/error
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  agentContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2937",
  },
  refreshButton: {
    marginLeft: 12,
    padding: 4,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FDFDFD",
    borderRadius: 16,
    marginBottom: 12,
    width: width - 32,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  chatContent: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  textAvatarBackground: {
    backgroundColor: "#bbbfccff", // A light blue background for the text avatar
    justifyContent: "center",
    alignItems: "center",
  },
  textAvatar: {
    color: "#4F46E5", // Darker blue text color
    fontSize: 20,
    fontWeight: "bold",
  },
});
