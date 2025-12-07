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
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "../auth/action";
import RazorpayCheckout from "../pay/RazorpayCheckout";
import { createRazorpayOrder } from "../pay/razorpay_api";
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentVisible, setPaymentVisible] = useState(false);
  const [isPaidCallConfirmation, setIsPaidCallConfirmation] = useState(false);
  const [userPrefillData, setUserPrefillData] = useState<
    { name?: string; email?: string; contact?: string } | undefined
  >(undefined);
  const paidCallPrice = 49;
  const router = useRouter();

  const handleFreeCallPress = () => {
    if (!selected) {
      Alert.alert(
        "आवश्यक",
        "आगे बढ़ने से पहले कृपया फसल का चयन करें।"
      );
      return;
    }
    setIsPaidCallConfirmation(false);
    setConfirmationModalVisible(true);
  };

  const handlePaidCallPress = async () => {
    if (!selected) {
      Alert.alert("आवश्यक", "आगे बढ़ने से पहले कृपया फसल का चयन करें।");
      return;
    }

    const user = await getUserData();
    if (!user) {
      Alert.alert(
        "Login Required",
        "You need to be logged in for a paid call.",
        [{ text: "OK", onPress: () => router.push("/phoneLoginScreen") }]
      );
      return;
    }

    setUserPrefillData({
      name: user.name || undefined,
      email: user.email_id || undefined,
      contact: user.mobile_number || undefined,
    });

    setIsLoading(true);
    try {
      const newOrderId = await createRazorpayOrder(paidCallPrice); // price in paise
      if (newOrderId) {
        setOrderId(newOrderId);
        setPaymentVisible(true);
        setIsPaidCallConfirmation(true); // Set to true for paid call confirmation
      } else {
        Alert.alert("Error", "Could not create a payment order.");
      }
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to create a payment order."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentVisible(false);
    setConfirmationModalVisible(true); // Show confirmation modal after payment
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
              onPaidPress={handlePaidCallPress}
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
                <Text style={callRequestStyles.modalValue}>{selectedLabel}</Text>

                <TouchableOpacity
                  style={callRequestStyles.sendButton}
                  onPress={async () => {
                    // This will now handle both free and paid call request sending
                    setConfirmationModalVisible(false);

                    const user = await getUserData();
                    if (!user) {
                      // This should ideally not happen if checks are in place
                      // but as a fallback, we can alert and redirect.
                      Alert.alert(
                        "Login Required",
                        "You need to be logged in to make a call request.",
                        [
                          {
                            text: "OK",
                            onPress: () => router.push("/phoneLoginScreen"),
                          },
                        ]
                      );
                      return;
                    }

                    const message = `Crop: ${selectedLabel}`;

                    const callRequestPayload = {
                      id: `call-${Date.now()}`,
                      paid: isPaidCallConfirmation,
                      user_id: user.id,
                      user_name: user.name || "Unknown User",
                      message: message,
                      request_time: new Date().toISOString(),
                      status: "requested",
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

          {/* Loading Modal */}
          <Modal transparent={true} animationType="none" visible={isLoading}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
            </View>
          </Modal>

          {/* Razorpay Checkout Modal */}
          {orderId && userPrefillData && (
            <RazorpayCheckout
              visible={isPaymentVisible}
              orderId={orderId}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setPaymentVisible(false)}
              prefill={userPrefillData}
            />
          )}
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
