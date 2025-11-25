import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./callStyles";

export default function CallRequestScreen() {
  const [dropdownModalVisible, setDropdownModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [selected, setSelected] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("फसल चुने");
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "सहायता फ़ॉर्म",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitleAlign: "left",

        }}
      />
      <SafeAreaView style={pageStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={pageStyles.formContainer}>
            <Text style={pageStyles.label}>अपना सवाल यहाँ लिखें</Text>
            <TextInput
              style={pageStyles.input}
              onChangeText={setQuery}
              value={query}
              multiline={true}
              placeholder="Type here..."
            />
            {/* Custom Dropdown Trigger */}
            <TouchableOpacity
              style={[dropdownStyles.box, pageStyles.dropdown]}
              onPress={() => setDropdownModalVisible(true)}
            >
              <Text style={dropdownStyles.placeholder}>{selectedLabel}</Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </TouchableOpacity>

            <Modal
              animationType="fade"
              transparent={true}
              visible={dropdownModalVisible}
              onRequestClose={() => setDropdownModalVisible(false)}
            >
              <DropdownModalContent
                data={data}
                onSelect={(item) => {
                  setSelected(item.value);
                  setSelectedLabel(item.value);
                  setDropdownModalVisible(false);
                }}
                onClose={() => setDropdownModalVisible(false)}
              />
            </Modal>

            <View style={pageStyles.buttonContainer}>
              <TouchableOpacity
                style={[pageStyles.button, pageStyles.buttonFree]}
                onPress={() => setConfirmationModalVisible(true)}
              >
                <Text style={styles.textStyle}>Free Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[pageStyles.button, pageStyles.buttonPaid]}
                onPress={() => router.back()}
              >
                <Text style={styles.textStyle}>Paid Call</Text>
              </TouchableOpacity>
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={confirmationModalVisible}
              onRequestClose={() => setConfirmationModalVisible(false)}
            >
              <View style={confirmationModalStyles.modalOverlay}>
                <View style={confirmationModalStyles.modalContent}>
                  <Text style={confirmationModalStyles.title}>Confirm Details</Text>
                  <Text style={confirmationModalStyles.label}>Your Query:</Text>
                  <Text style={confirmationModalStyles.value}>{query || "Not provided"}</Text>
                  <Text style={confirmationModalStyles.label}>Selected Crop:</Text>
                  <Text style={confirmationModalStyles.value}>{selectedLabel}</Text>

                  <TouchableOpacity
                    style={confirmationModalStyles.sendButton}
                    onPress={() => {
                      setConfirmationModalVisible(false);
                      const requestMessage = `Query: ${query || "N/A"}\nCrop: ${selectedLabel || "N/A"}`;
                      router.push({
                        pathname: "/(tabs)/chat",
                        params: { callRequest: requestMessage },
                      });
                    }}
                  >
                    <Text style={confirmationModalStyles.sendButtonText}>अनुरोध भेजें</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setConfirmationModalVisible(false)}>
                     <Text style={confirmationModalStyles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const DropdownModalContent = ({ data, onSelect, onClose }) => (
  <TouchableOpacity
    style={dropdownStyles.modalOverlay}
    activeOpacity={1}
    onPress={onClose}
  >
    <View style={dropdownStyles.modalContent}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={dropdownStyles.item}
            onPress={() => onSelect(item)}
          >
            <Text style={dropdownStyles.itemText}>{item.value}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </TouchableOpacity>
);

const pageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    textAlignVertical: "top",
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  buttonFree: {
    backgroundColor: "#16A34A", // Green color
  },
  buttonPaid: {
    backgroundColor: "#F43F5E", // Rose color from original styles
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const dropdownStyles = StyleSheet.create({
  box: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
  },
  placeholder: { color: "#888" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  item: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemText: { fontSize: 16, textAlign: "center" },
});

const confirmationModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    width: "85%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    color: "#666",
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: "#000",
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeText: {
    color: "#007AFF",
    marginTop: 15,
    fontSize: 16,
  },
});

const data = [
  { key: "1", value: "धान (चावल)" },
  { key: "2", value: "मक्का" },
  { key: "3", value: "ज्वार" },
  { key: "4", value: "बाजरा" },
  { key: "5", value: "सोयाबीन" },
  { key: "6", value: "मूंगफली" },
  { key: "7", value: "कपास" },
  { key: "8", value: "अरहर (तूर)" },
  { key: "9", value: "मूंग" },
];