import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { app, auth } from "./firebaseConfig";

export default function PhoneLoginScreen() {
  const router = useRouter();
  const recaptchaVerifier = useRef<any>(null);
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [callingCode, setCallingCode] = useState("91");

  const sendOtp = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const fullPhoneNumber = phone; // phone already contains +91

      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullPhoneNumber,
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

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // 🔍 Check in Firestore if user exists
      //   const userRef = doc(db, "users", user.uid);
      //   const userSnap = await getDoc(userRef);

      //   if (userSnap.exists()) {
      //     console.log("Existing user:", user.uid);
      //     router.navigate("/(tabs)");
      //   } else {
      //     console.log("New user:", user.uid);
      //     router.navigate("/signup");
      //     // router.push({ pathname: "/signup", params: { phone: user.phoneNumber }});
      //   }

      // 🔐 Generate JWT token
      const token = await user.getIdToken();
      console.log("JWT Token:", token);

      setMessage("Phone authentication successful!");
      router.navigate("/(tabs)");
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

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Login with Phone</Text>

      {!verificationId ? (
        <>
          <View style={styles.phoneInputContainer}>
            {/* Country picker with flag and triangle */}
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withCallingCode
              withFilter
              withAlphaFilter
              onSelect={(country: Country) => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0]);
                // Automatically fill input with +code if empty
                if (!phone.startsWith(`+${country.callingCode[0]}`)) {
                  setPhone(`+${country.callingCode[0]}`);
                }
              }}
              containerButtonStyle={styles.countryPickerButton}
            />
            {/* Triangle/dropdown indicator */}
            <Text style={styles.arrow}>▼</Text>

            {/* Phone input with code prefixed */}
            <TextInput
              style={styles.inputWithPrefix}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              maxLength={13} // +91 + 10 digits
              value={phone}
              onChangeText={(text) => {
                // Ensure country code stays at start
                if (!text.startsWith(`+${callingCode}`)) {
                  text = `+${callingCode}` + text.replace(/^\+\d*/, "");
                }
                setPhone(text);
              }}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
          <View style={styles.container}>
            {/* Your screen content here */}

            <View style={styles.bottomContainer}>
              <Text style={styles.agreementText}>
                By proceeding, you agree with our{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => console.log("Terms clicked")}
                >
                  Terms of Service
                </Text>
                ,{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => console.log("Privacy clicked")}
                >
                  Privacy Policy
                </Text>{" "}
                &{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => console.log("User Agreement clicked")}
                >
                  User Agreement
                </Text>
              </Text>
            </View>
          </View>
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
    marginBottom: 18,
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
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    color: "green",
  },
  logoContainer: {
    alignItems: "center", // centers horizontally
  },
  logo: {
    width: 260,
    height: 260,
  },
  countryPickerButton: {
    marginRight: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  agreementText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
    color: "#000", // normal text color
  },
  linkText: {
    color: "#4a90e2", // blue color
    textDecorationLine: "underline", // optional, for a link look
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  countryPicker: {
    marginRight: 5,
  },
  arrow: {
    fontSize: 16,
    marginRight: 5,
  },
  inputWithPrefix: {
    flex: 1,
    paddingVertical: 12,
  },
});
