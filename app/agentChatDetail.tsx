import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "./auth"; // Assuming DecodedToken is defined here or similar
import ChatView from "./components/ChatView";

const { width } = Dimensions.get("window");

export default function AgentChatDetail() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { id, userName } = params;
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const [messages, setMessages] = useState<IMessage[] | undefined>(undefined); // Start as undefined
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

  const ws = useRef<WebSocket | null>(null);
  const isClosing = useRef(false);

  // Establish WebSocket connection when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!agentId || !id) return; // Wait for agentId and userId

      const userId = id as string;
      isClosing.current = false;
      setConnectionStatus("Connecting...");
      const websocketUrl = `wss://dev-backend-py-23809827867.us-east1.run.app/chat/ws/${userId}/${agentId}/agent`;
      ws.current = new WebSocket(websocketUrl);

      ws.current.onopen = () => {
        // console.log("WebSocket Connected for agent:", agentId, "chatting with user:", userId);
        setConnectionStatus("Connected");
      };
      ws.current.onmessage = (event) => {
        try {
          const incomingData = JSON.parse(event.data);
          // console.log("Received data:", incomingData);

          // Handle both history ({ messages: [...] }) and single message objects
          const messagesFromServer = incomingData.messages || incomingData;

          const newMessages: IMessage[] = Array.isArray(messagesFromServer)
            ? messagesFromServer
            : messagesFromServer ? [messagesFromServer] : [];
          if (newMessages.length === 0) return;

          setMessages((previousMessages) => {
            // Ensure previousMessages is an array, even if it's undefined initially
            const currentMessages = previousMessages || [];

            // Filter out any messages that are already in the state
            const uniqueNewMessages = newMessages.filter(
              (msg) => msg && !currentMessages.some((prevMsg) => prevMsg._id === msg._id)
            );
            if (uniqueNewMessages.length === 0) return currentMessages;
            const allMessages = GiftedChat.append(currentMessages, uniqueNewMessages);
            // Sort all messages by date to ensure correct order.
            // GiftedChat expects newest messages to be at the start of the array.
            return allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        } catch (e) {
        }
      };

      ws.current.onerror = (error) => {
        if (isClosing.current) return;
        console.error("WebSocket Error:", error);
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket Disconnected:", event.code, event.reason);
        setConnectionStatus("Disconnected");
      };

      // Clean up WebSocket on component unmount or when the screen loses focus
      return () => {
        isClosing.current = true;
        ws.current?.close();
      };
    }, [agentId, id]) // Reconnect if agentId or userId changes
  );

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (!agentId || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not connected or agent not available");
        return;
      }

      const message = newMessages[0];
      const messageToSend = {
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        user: {
          _id: agentId,
          name: "Agent", // Or a dynamic agent name if available
        },
      };

      ws.current.send(JSON.stringify(messageToSend));

      // Optimistically update the UI
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    },
    [agentId]
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
        messages={messages || []}
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
    marginLeft: 12,
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
