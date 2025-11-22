import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function AgentLogin() {
  const router = useRouter();
  const [mobile_number, setMobileNumber] = useState("+91");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!mobile_number || !password) {
      Alert.alert(
        "Validation Error",
        "Please enter both mobile number and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://dev-backend-py-23809827867.us-east1.run.app/user/pw/auth",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Role": "agent" },
          body: JSON.stringify({
            mobile_number: mobile_number.replace(/\s/g, ""), // Remove spaces before sending
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        await setLoginJwtToken(data.token);
        await fetchAndSaveUser("agent", "password");
        router.replace("../(tabs)");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong during login.");
    } finally {
      setLoading(false);
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
    setMobileNumber(formattedText);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Agent Login</Text>

          <View style={styles.phoneInputContainer}>
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withCallingCode
              withFilter
              withAlphaFilter
              onSelect={(country: Country) => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0]);
                setMobileNumber(`+${country.callingCode[0]}`);
              }}
              containerButtonStyle={styles.countryPickerButton}
            />
            <Text style={styles.arrow}>▼</Text>
            <TextInput
              style={styles.inputWithPrefix}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              maxLength={15} // +91 XXXXX XXXXX
              value={mobile_number}
              onChangeText={handlePhoneChange}
            />
          </View>

          <View style={styles.passwordInputContainer}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordVisibilityToggle}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
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
  countryPickerButton: {
    paddingVertical: 10,
  },
  arrow: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  inputWithPrefix: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
  },
  passwordVisibilityToggle: {
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
