import { auth } from "@/app/firebaseConfig"; // ✅ adjust the path as needed
import { useRouter } from "expo-router";
import { signInWithPhoneNumber } from "firebase/auth";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const recaptchaVerifier = useRef<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Send OTP
  const sendOtp = async () => {
    if (!phoneNumber.startsWith("+")) {
      Alert.alert("Invalid Number", "Use full format like +91XXXXXXXXXX");
      return;
    }
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier.current
      );
      setConfirmationResult(confirmation);
      Alert.alert("OTP Sent", "Check your phone for the verification code.");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      Alert.alert("Error", error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    if (!confirmationResult) {
      Alert.alert("Error", "Please request OTP first.");
      return;
    }
    if (otp.trim().length < 6) {
      Alert.alert("Invalid Code", "Enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await confirmationResult.confirm(otp);
      Alert.alert("Success", `Welcome ${userCredential.user.phoneNumber}`);
      // ✅ Redirect after login
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Recaptcha Modal (Required by Firebase) */}
      {/* <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      /> */}

      <Text style={styles.title}>Login with Phone</Text>

      {!confirmationResult ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={sendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ✅ Basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
