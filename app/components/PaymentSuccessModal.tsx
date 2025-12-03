import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";



interface PaymentSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  congratsText?: string;
  additionalText?: string;
  price?: number;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onClose,
  congratsText = "बधाई हो!",
  additionalText = "हमारी टीम आपसे जल्द ही संपर्क करेगी।",
  price,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View entering={FadeInUp.duration(500)} style={styles.modalContent}>
          {price && (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Payment Received</Text>
              <Text style={styles.priceAmount}>₹{price}</Text>
            </Animated.View>
          )}

          <View style={styles.iconContainer}>
            <Text style={styles.flower}>🌸</Text>
            <MaterialCommunityIcons
              name="check-decagram"
              size={80}
              color="#4CAF50"
            />
            <Text style={styles.flower}>🌸</Text>
          </View>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.congratsText}>
            {congratsText}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(400)} style={styles.subText}>
            {additionalText}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(600)}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>ठीक है</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%",
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  flower: {
    fontSize: 30,
    marginHorizontal: 10,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});



export default PaymentSuccessModal;
