import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import ChatView from "./components/ChatView";

export default function AgentChatDetail() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { id, userName } = params;

  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: userName,
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName, router]);

  useEffect(() => {
    // Mock initial messages for the agent's conversation
    setMessages([
      {
        _id: 1,
        text: `Hello ${userName}, how can I assist you today?`,
        createdAt: new Date(),
        user: {
          _id: "agent", // Agent's ID
          name: "Agent",
          avatar: require("@/assets/images/logo.png"), // Agent's avatar
        },
      },
      {
        _id: 2,
        text: "I have a question about my policy.",
        createdAt: new Date(Date.now() - 60000), // 1 minute ago
        user: {
          _id: id as string, // User's ID
          name: userName as string,
          avatar: require("@/assets/images/profile_img.jpg"), // User's avatar (mocked)
        },
      },
    ]);
  }, [id, userName]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
    // Here you would typically send the message to your backend
    console.log("Agent sent message:", newMessages[0].text);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ChatView
        messages={messages}
        onSend={onSend}
        user={{
          _id: "agent", // Agent's ID
          name: "Agent",
          avatar: require("@/assets/images/logo.png"), // Agent's avatar
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Add any specific styles for AgentChatDetail if needed
});
