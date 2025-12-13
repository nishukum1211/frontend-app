import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "../auth/action";
import ChatView from "../components/ChatView";
import { loadAllChatsFromCache, updateChat } from "./chatCache";
import { webSocketManager } from "./websocketOps";

export default function AgentChatDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, userName } = params;
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const userId = id as string;
  const [messages, setMessages] = useState<IMessage[]>([]); // Start as empty array
  const [agentId, setAgentId] = useState<string | null>(null);
  // Fetch agent's ID from SecureStore
  useEffect(() => {
    const getAgentData = async () => {
      const agent = await getUserData();
      if (agent) {
        setAgentId(agent.id);
      } else {
        router.replace("/adminLogin");
      }
    };
    getAgentData();
  }, [router]);

  const loadCachedMessages = useCallback(async () => {
    try {
      const allChats = await loadAllChatsFromCache();
      if (allChats) {
        const cachedChat = allChats[id as string];
        if (cachedChat && cachedChat.all && cachedChat.all.length > 0) {
          // Sort newest first for GiftedChat
          const sortedMessages = [...cachedChat.all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMessages(sortedMessages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to load cached messages:", error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (!agentId || !id) return; // Wait for agentId and userId

      // Load cached messages first
      loadCachedMessages();

      // Connect WebSocket
      webSocketManager.connect(
        { userId, agentId, role: "agent" },
        {
          onOpen: () => setConnectionStatus("Connected"),
          onMessage: (event, messageUserId) => {
            // Handle incoming messages if needed
          },
          onError: (error, errorUserId) => {
            console.log(`WebSocket Error for user ${errorUserId}:`, error);
          },
          onClose: (event, closeUserId) => {
            console.log(
              `WebSocket Disconnected for user ${closeUserId}:`,
              event.code,
              event.reason
            );
            setConnectionStatus("Disconnected");
          },
        }
      );

      return () => {
        // webSocketManager.disconnect(userId);
      };
    }, [agentId, id, loadCachedMessages]) // Reconnect if agentId or userId changes
  );

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!agentId) {
        console.error("Agent not available");
        return;
      }

      const sentMessage = newMessages[0];

      // 1. Optimistically update the UI with the initial message (with temporary image URI)
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );

      // 2. Process the image and get the updated message with the final URI
      const updatedMessage = await updateChat(userId, sentMessage, "agent");

      // 3. Update the UI again with the correct image URI
      setMessages((previousMessages) => {
        // Find the original message by its ID and replace it with the updated one
        const newMsgs = previousMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        );
        return newMsgs;
      });

      // 4. Send the message through the websocket
      webSocketManager.sendChat(updatedMessage, userId);
    },
    [agentId, userId]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* ===== CUSTOM HEADER ===== */}
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={[styles.avatar, styles.textAvatarBackground]}>
          <Text style={styles.textAvatar}>
            {userName ? (userName as string).substring(0, 2).toUpperCase() : ""}
          </Text>
        </View>

        {/* User Name */}
        <View style={styles.nameContainer}>
          <Text numberOfLines={1} style={styles.userName}>
            {userName}
          </Text>
        </View>
      </View>
      <View style={[
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
        user={{ // This user prop represents the current user of the chat (the agent in this case)
          _id: agentId || "agent", // Use the actual agentId if available,
          name: "Agent",
          avatar: require("@/assets/images/logo.png"), // Agent's avatar
        }}
      />
    </View>
    </SafeAreaView>
  );
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
   backArrow: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  textAvatarBackground: {
    backgroundColor: "#bbbfccff",
    justifyContent: "center",
    alignItems: "center",
  },
  textAvatar: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "bold",
  },
});
