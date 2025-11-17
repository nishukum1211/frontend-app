import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getUserData } from "./auth"; // Assuming DecodedToken is defined here or similar
import ChatView from "./components/ChatView";

export default function AgentChatDetail() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { id, userName } = params;
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Set header options for the chat screen
  useEffect(() => {
    console.log("🚀 ~ AgentChatDetail ~ userName:", userName);
    navigation.setOptions({
      title: userName || 'Chat',
      headerTitleAlign: "center",
    });
  }, [navigation, userName, router]);

  // Fetch agent's ID from SecureStore
  useEffect(() => {
    const getAgentData = async () => {
      const agent = await getUserData();
      if (agent) {
        setAgentId(agent.id);
      }
    };
    getAgentData();
  }, []);

  const ws = useRef<WebSocket | null>(null);

  // Establish WebSocket connection
  useEffect(() => {
    if (!agentId || !id) return; // Wait for agentId and userId

    const userId = id as string;
    setConnectionStatus("Connecting...");
    const websocketUrl = `wss://dev-backend-py-23809827867.us-east1.run.app/chat/ws/${userId}/${agentId}/agent`;
    ws.current = new WebSocket(websocketUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected for agent:", agentId, "chatting with user:", userId);
      setConnectionStatus("Connected");
    };
    ws.current.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        console.log("Received data:", incomingData);

        if (!incomingData) return; // Don't proceed if data is null

        // Check if the payload has a 'messages' property (for history) or is a single message object.
        const messages = incomingData.messages || incomingData;

        const newMessages: IMessage[] = Array.isArray(messages) ? messages : [messages];

        // Append the new messages to the chat
        if (newMessages.length > 0)
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
      } catch (e) {
        console.error("Failed to parse or process message:", e);
      }
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
  }, [agentId, id, userName]); // Reconnect if agentId or userId changes

  const onSend = useCallback((newMessages: IMessage[] = []) => {
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
        name: "Agent",
      },
    };

    ws.current.send(JSON.stringify(messageToSend));
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, [agentId]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
});
