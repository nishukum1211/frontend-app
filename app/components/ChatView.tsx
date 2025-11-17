import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import {
  Bubble,
  BubbleProps,
  GiftedChat,
  IMessage,
  InputToolbar,
  InputToolbarProps,
  Send,
  User,
} from "react-native-gifted-chat";

interface ChatViewProps {
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  user: User;
}

export default function ChatView({ messages, onSend, user }: ChatViewProps) {
  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={user}
      messageIdGenerator={() => `${Date.now()}-${Math.random()}`}
      textInputProps={{
        style: { color: "#000", flex: 1, marginLeft: 10 },
      }}
      renderBubble={(props: BubbleProps<IMessage>) => (
        <Bubble
          {...props}
          wrapperStyle={{
            right: { backgroundColor: "#4F46E5" },
            left: { backgroundColor: "#E5E7EB" },
          }}
          textStyle={{
            right: { color: "#fff" },
            left: { color: "#111827" },
          }}
        />
      )}
      renderInputToolbar={(props: InputToolbarProps<IMessage>) => (
        <InputToolbar
          {...props}
          containerStyle={{
            borderTopWidth: 0,
            backgroundColor: "#F9FAFB", marginBottom: 10
          }}
          primaryStyle={{ alignItems: "center" }}
        />
      )}
      renderSend={(props) => (
        <Send {...props} containerStyle={{ justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <Feather name="send" size={24} color="#4F46E5" />
        </Send>
      )}
      alwaysShowSend
      showAvatarForEveryMessage
      isScrollToBottomEnabled={true}
      scrollToBottomComponent={() => (
        <View><Text style={{ color: "#4F46E5", fontWeight: "bold", fontSize: 18 }}>↓</Text></View>
      )}
    />
  );
}