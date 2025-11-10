import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./LoginScreenStyles";
type Props = {
  onClose?: () => void;
};

const LoginScreen: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const handleSendOTP = () => {
    if (phoneNumber.trim().length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return;
    }
    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (otp.trim().length < 4) {
      Alert.alert("Invalid OTP", "Please enter the correct OTP");
      return;
    }
    Alert.alert("Success", "OTP Verified ✅");
    // Consider user logged in — notify parent to show home
    if (onClose) onClose();
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (onClose) onClose();
            }}
            accessibilityLabel="Close login"
          >
            <FontAwesome name="close" size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.title}>Login via OTP</Text>

          {step === 1 ? (
            <>
              <Text style={styles.label}>Enter Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
                <Text style={styles.buttonText}>Send OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder="4 or 6 digit code"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>Change number?</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default LoginScreen;
