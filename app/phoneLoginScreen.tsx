import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { app, auth } from "./firebaseConfig";

export default function PhoneLoginScreen() {
  const router = useRouter();
  const recaptchaVerifier = useRef<any>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const sendOtp = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      setMessage("OTP sent!");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const confirmOtp = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId!, otp);
      await signInWithCredential(auth, credential);
      setMessage("Phone authentication successful!");
      router.replace("/(tabs)/profile");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Recaptcha */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
      />

      <Text style={styles.title}>Login with Phone</Text>

      {!verificationId ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number e.g. +91 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.button} onPress={confirmOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    color: "green",
  },
});
