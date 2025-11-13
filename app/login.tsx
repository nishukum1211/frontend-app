import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import styles from "./loginStyle";

type Props = {
  onClose?: () => void; // This is how the parent will show home screen
};

const Login: React.FC<Props> = ({ onClose }) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    mobile_number: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Missing Info", "Enter both phone number and password");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        mobile_number: phoneNumber,
        password: password,
      };

      const response = await fetch(
        "https://dev-backend-py-23809827867.us-east1.run.app/user/auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        // ✅ Save JWT token locally
        await AsyncStorage.setItem("jwtToken", data.token);

        // (Optional) Decode to check info
        const decoded = jwtDecode(data.token);
        console.log("Decoded User:", decoded);

        // Navigate to profile or main tabs
        router.replace("/(tabs)/profile");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // When user taps outside the popup
  const handleOutsidePress = () => {
    if (onClose) onClose(); // close modal and show home
  };

  return (
    <Modal visible transparent animationType="fade">
      {/* Outer touch closes modal */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.modalOverlay}>
          {/* Prevent inner press from closing modal */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <Text style={styles.title}>Login</Text>

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert("Feature coming soon!")}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>Forgot password?</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default Login;
