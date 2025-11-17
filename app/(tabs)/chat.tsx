import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

import { DecodedToken, getUserData, removeUserData } from "../auth";
import ChatView from "../components/ChatView";

// Mock agent chat data
const mockChats = [
  {
    id: "1",
    userName: "John Doe",
    lastMessage: "I have a question about my policy.",
    avatar: require("@/assets/images/profile_img.jpg"),
  },
  {
    id: "2",
    userName: "Jane Smith",
    lastMessage: "Can you help me with a claim?",
    avatar: require("@/assets/images/profile_img.jpg"),
  },
  {
    id: "3",
    userName: "Peter Jones",
    lastMessage: "Thank you for your help!",
    avatar: require("@/assets/images/profile_img.jpg"),
  },
];

const { width } = Dimensions.get("window");

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<IMessage[]>([]);

  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        setLoading(true);
        const storedUser = await getUserData();

        if (storedUser) {
          if (storedUser.exp && storedUser.exp * 1000 < Date.now()) {
            await removeUserData();
            router.replace("/profile");
          } else {
            setUser(storedUser);
            if (storedUser.role !== "agent") {
              setMessages([
                {
                  _id: 1,
                  text: "Hello! How can I help you today?",
                  createdAt: new Date(),
                  user: {
                    _id: 2,
                    name: "Support Agent",
                    avatar: require("@/assets/images/logo.png"),
                  },
                },
              ]);
            }
            setLoading(false);
          }
        } else {
          router.replace("/profile");
        }
      };

      checkAuthStatus();
    }, [])
  );

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

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
          data={mockChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "agentChatDetail",
                  params: {
                    id: item.id,
                    userName: item.userName,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.chatContent}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
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
    <ChatView
      messages={messages}
      onSend={onSend}
      user={{
        _id: user.id,
        name: user.name,
      }}
    />
  ) : null;
}

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});
