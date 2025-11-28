import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CallRequest } from "../components/CallRequestWidget";
import CallInfoSection from "./callInfoSection";
import callRequestStyles from "./callRequestStyles";

type DropdownItem = {
  key: string;
  value: string;
};

type DropdownProps = {
  data: DropdownItem[];
  onSelect: (item: DropdownItem) => void;
  onClose: () => void;
};

export default function CallRequestScreen() {
  const [dropdownModalVisible, setDropdownModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [selected, setSelected] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("फसल चुने");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleFreeCallPress = () => {
    if (!selected) {
      Alert.alert(
        "आवश्यक",
        "आगे बढ़ने से पहले कृपया अपना प्रश्न लिखें और एक फसल का चयन करें।"
      );
      return;
    }
    setConfirmationModalVisible(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="phone" size={20} color="#0F172A" />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: "#0F172A",
                  marginLeft: 10,
                }}
              >
                कॉल अनुरोध फ़ॉर्म
              </Text>
            </View>
          ),
        }}
      />

      <SafeAreaView style={callRequestStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={{ padding: 5 }}>
            {/* 🌾 Dropdown on Top */}
            <TouchableOpacity
              style={callRequestStyles.dropdownBox}
              onPress={() => setDropdownModalVisible(true)}
            >
              <Text style={callRequestStyles.dropdownText}>
                {selectedLabel}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </TouchableOpacity>

            {/* Info Cards */}
            {/* Info Cards */}
            <CallInfoSection
              onFreePress={handleFreeCallPress}
              onPaidPress={() => router.back()}
            />
          </View>

          {/* Dropdown Modal */}
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

          {/* Confirmation Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={confirmationModalVisible}
            onRequestClose={() => setConfirmationModalVisible(false)}
          >
            <View style={callRequestStyles.modalOverlay}>
              <View style={callRequestStyles.modalBox}>
                <Text style={callRequestStyles.modalTitle}>
                  Confirm Details
                </Text>

                <Text style={callRequestStyles.modalLabel}>Selected Crop:</Text>
                <Text style={callRequestStyles.modalValue}>
                  {selectedLabel}
                </Text>

                <TouchableOpacity
                  style={callRequestStyles.sendButton}
                  onPress={() => {
                    setConfirmationModalVisible(false);
                    const callRequestPayload: CallRequest = {
                      id: `call-${Date.now()}`,
                      type: "call-request",
                      heading: "Free Call",
                      message: query || "No message provided.",
                      crops:
                        selectedLabel !== "फसल चुने" ? [selectedLabel] : [],
                      status: 0,
                    };

                    router.push({
                      pathname: "/(tabs)/chat",
                      params: {
                        callRequest: JSON.stringify(callRequestPayload),
                      },
                    });
                  }}
                >
                  <Text style={callRequestStyles.sendButtonText}>
                    अनुरोध भेजें
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConfirmationModalVisible(false)}
                >
                  <Text style={callRequestStyles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

/* ----------------------- DROPDOWN MODAL --------------------- */

const DropdownModalContent = ({ data, onSelect, onClose }: DropdownProps) => (
  <TouchableOpacity
    style={callRequestStyles.modalOverlay}
    activeOpacity={1}
    onPress={onClose}
  >
    <View style={callRequestStyles.modalBox}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ paddingVertical: 12 }}
            onPress={() => onSelect(item)}
          >
            <Text style={{ fontSize: 16, textAlign: "center" }}>
              {item.value}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  </TouchableOpacity>
);

/* ----------------------- DROPDOWN DATA ---------------------- */

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
