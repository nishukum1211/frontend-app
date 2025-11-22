import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"; // Removed unused `Dimensions` import
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getUserData } from "../auth/action";
import { DecodedToken, getLoginJwtToken, removeUserData } from "../auth/auth";
import { fetchAllChatsAndCache, loadAgentChatListFromCache, loadAllChatsFromCache, updateChat } from "../chat/chatCache";
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
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [agentChats, setAgentChats] = useState<AgentChatItem[]>([]);

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

      checkAuthStatus();
    }, [router])
  );

  const ws = useRef<WebSocket | null>(null);

  // Fetch agent chats when user is an agent
  useEffect(() => {
    const initializeAgentView = async () => {
      if (user?.role !== "agent") return;

      setLoading(true);

      const getLoginJwtToken = async (): Promise<string | null> => {
        return await require("expo-secure-store").getItemAsync("loginJwtToken");
      };
      const token = await getLoginJwtToken();
      if (token) {
        await fetchAllChatsAndCache("agent"); // This fetches and updates the cache
        const updatedChats = await loadAgentChatListFromCache();
        // Pretty-print the JSON to the console for better readability
        // console.log("Agent chats from cache:", JSON.stringify(updatedChats, null, 2));
        if (updatedChats) setAgentChats(updatedChats);
      } else {
        console.error("Agent is logged in but no token found.");
      }
      setLoading(false);
    };

    initializeAgentView();
  }, [user]); // Re-fetch if the user object changes

  useEffect(() => {
    if (!user || user.role === "agent") return; // Only connect if it's a regular user
    
    // Load cached messages for the user
    const loadCachedMessages = async () => {
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

    setConnectionStatus("Connecting...");
    // Establish WebSocket connection
    const websocketUrl = `wss://dev-backend-py-23809827867.us-east1.run.app/chat/ws/${user.id}/${SUPPORT_AGENT_ID}/user`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected for user:", user.id);
      setConnectionStatus("Connected");
    };

    ws.current.onmessage = (event) => {
      // console.log("Received message:", event.data);
      return;
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket Disconnected:", event.code, event.reason);
      setConnectionStatus("Disconnected");
    };

    // Clean up WebSocket on component unmount
    return () => {
      ws.current?.close();
    };
  }, [user]); // Reconnect if user changes

  const onSend = useCallback(
    (messages: IMessage[] = []) => {
      if (!user || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not connected or user not available");
        return;
      }

      const message = messages[0];
      const messageToSend = {
        _id: message._id, // The unique ID of the message
        text: message.text, // The text content of the message
        createdAt: message.createdAt, // The timestamp of the message
        image: message.image, // The ID of the image, if it exists
        user: {
          _id: user.id,
          name: user.name,
        },
      };

      ws.current.send(JSON.stringify(messageToSend));
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      // Call updateChat for sent message
      updateChat(user.id, message, "user").catch(error => {
        console.error("Failed to update chat cache on send:", error);
      });
    },
    [user]
  );

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
        <Text style={styles.header}>Conversations</Text>
        <FlatList
          data={agentChats}
          keyExtractor={(item) => item.id}
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
  header: {
    fontSize: 26,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 20,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
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
