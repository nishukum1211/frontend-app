import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import {
  getAdditionalUserInfo,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAndSaveUser } from "./auth/action";
import { setLoginJwtToken } from "./auth/auth";
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

  const handlePhoneChange = (text: string) => {
    const prefix = `+${callingCode}`;
    let digits = text.replace(prefix, "").replace(/\D/g, ""); // Remove non-digits

    // Limit to 10 digits
    if (digits.length > 10) {
      digits = digits.slice(0, 10);
    }

    let formattedText = prefix;
    if (digits.length > 0) {
      if (digits.length <= 5) {
        formattedText = `${prefix} ${digits}`;
      } else {
        formattedText = `${prefix} ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
    }

    // Handle backspacing
    setPhone(formattedText);
  };

  const confirmOtp = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId!, otp);

      const userCredential = await signInWithCredential(auth, credential);
      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      const user = userCredential.user;

      // Generate JWT token
      const token = await user.getIdToken(/* forceRefresh */ true);
      await setLoginJwtToken(token);

      setMessage("Phone authentication successful!");

      if (additionalUserInfo?.isNewUser) {
        // New user, redirect to a sign-up completion screen
        router.navigate(
          `./signup?mobile_number=${encodeURIComponent(
            phone.replace(/\s/g, "")
          )}`
        );
      } else {
        // Existing user, go to home
        await fetchAndSaveUser();
        router.replace("./(tabs)");
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <Text style={styles.title}>
            {verificationId ? "Confirm OTP" : "Login with Phone"}
          </Text>

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
                  maxLength={15} // +91 XXXXX XXXXX
                  value={phone}
                  onChangeText={handlePhoneChange}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={sendOtp}>
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ width: "100%" }}
              >
                <View style={styles.otpContainer}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={styles.otpBox}>
                      <Text style={styles.otpText}>{otp[index] || ""}</Text>
                    </View>
                  ))}
                  <TextInput
                    style={styles.hiddenInput}
                    value={otp}
                    onChangeText={(text) => {
                      if (text.length <= 6) setOtp(text.replace(/[^0-9]/g, ""));
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    caretHidden
                    autoFocus
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={confirmOtp}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </>
          )}
        </KeyboardAvoidingView>

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40, // Pushes content from top
    paddingBottom: 20,
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
    justifyContent: "flex-end", // Pushes agreement text to the bottom
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    fontSize: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    position: "relative",
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    width: 45,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: "transparent",
    fontSize: 24, // Make it large enough to be easily tapped
    letterSpacing: 30, // Adjust spacing to align with boxes
  },
});
