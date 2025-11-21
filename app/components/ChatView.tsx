import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
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
  MessageImage,
  Send,
  User
} from "react-native-gifted-chat";
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';

interface ChatViewProps {
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  user: User;
}

export default function ChatView({ messages, onSend, user }: ChatViewProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow camera access to send photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const message: IMessage = {
        _id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        user: user,
        image: imageUri,
        text: "",
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
            renderMessageImage={(bubbleProps) => {
              const imageUrl = bubbleProps.currentMessage?.image;
              if (!imageUrl) return null;
              return (
                <TouchableOpacity onPress={() => setFullScreenImage(imageUrl)}>
                  <MessageImage
                    {...bubbleProps}
                  />
                </TouchableOpacity>
              );
            }}
          />
        )}
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