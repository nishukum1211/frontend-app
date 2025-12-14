import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Bubble,
  BubbleProps,
  GiftedChat,
  IMessage,
  InputToolbar,
  InputToolbarProps,
  Send,
  User
} from "react-native-gifted-chat";
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import CachedImage from "../chat/CachedImage";
import { pickImageFromCamera } from "../components/imagePicker";
import CallRequestWidget from "./CallRequestWidget";

interface ChatViewProps {
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  user: User;
  chatId: string;
}

export default function ChatView({ messages, onSend, user, chatId }: ChatViewProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const imageUri = await pickImageFromCamera();

    if (imageUri) {
      const message: IMessage = {
        _id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        user: user,
        image: imageUri,
        text: "📷",
      };
      onSend([message]);
    }
  };
  return (
    <>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        messageIdGenerator={() => `${Date.now()}-${Math.random()}`}
        textInputProps={{
          style: { color: "#000", flex: 1, marginLeft: 10 },
        }}
        renderCustomView={(props) => { //
          const { currentMessage } = props; //
          if (
            currentMessage &&
            (currentMessage.type === "call-request" || currentMessage.type === "call-request-paid") &&
            currentMessage.data
          ) {
            return ( //
              <CallRequestWidget
                data={currentMessage.data}
                currentUser={currentMessage.user}
                heading={
                  currentMessage.data.paid ? "Paid Call" : "Free Call"
                }
              /> //
            );
          }
          return null;
        }}
        renderBubble={(props: BubbleProps<IMessage>) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: "#4F46E5" },
              left: { backgroundColor: "#E5E7EB" },
            }}
            textStyle={{
              right: { color: "#fff", fontSize: 16 },
              left: { color: "#111827", fontSize: 16 }, // Increased font size for left bubble
            }}
          />
        )}
        renderMessageImage={(props) => {
          const { currentMessage } = props;
          const imageUrl = currentMessage?.image;
          if (!imageUrl) return null;

          // This will be rendered inside the bubble if the message contains an image
          return (
            <CachedImage
              remoteUri={imageUrl}
              messageId={currentMessage._id as string}
              chatId={chatId}
              onPress={(uri) => {
                // console.log("ChatView: opening full screen image ->", uri);
                setFullScreenImage(uri);
              }}
            />
          );
        }}
        renderInputToolbar={(props: InputToolbarProps<IMessage>) => (
          <InputToolbar
            {...props}
            containerStyle={{
              borderTopWidth: 0,
              backgroundColor: "#F9FAFB",
              paddingVertical: 8,
              marginBottom: 10,
            }}
            primaryStyle={{ alignItems: "center" }}
          />
        )}
        renderActions={(props) => (
          <TouchableOpacity
            style={{ marginLeft: 10, marginBottom: 5 }}
            onPress={handlePickImage}
          >
            <Feather name="camera" size={24} color="#4F46E5" />
          </TouchableOpacity>
        )}
        renderSend={(props) => (
          <Send
            {...props}
            containerStyle={{
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Feather name="send" size={24} color="#4F46E5" />
          </Send>
        )}
        alwaysShowSend
        showAvatarForEveryMessage
        isScrollToBottomEnabled={true}
        scrollToBottomComponent={() => (
          <View>
            <Text style={{ color: "#4F46E5", fontWeight: "bold", fontSize: 18 }}>
              ↓
            </Text>
          </View>
        )}
      />
      {fullScreenImage && (
  <Modal
    isVisible={true}
    onBackdropPress={() => setFullScreenImage(null)}
    onBackButtonPress={() => setFullScreenImage(null)}
    style={{ margin: 0 }}
  >
    <ImageViewer
      imageUrls={[{ url: fullScreenImage }]}
      enableSwipeDown={true}
      onSwipeDown={() => setFullScreenImage(null)}
      renderIndicator={() => <View />} // Return a view to satisfy TS, effectively hiding the indicator
      backgroundColor="rgba(0,0,0,0.9)"
    />
  </Modal>
)}
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  }
});