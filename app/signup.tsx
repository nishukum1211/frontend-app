import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAndSaveUser, getLoginJwtToken } from "./auth";
import CustomButton from "./components/Button";

export default function Signup() {
  const router = useRouter(); // ✅ Move it here (top-level)
  const { mobile_number: raw_mobile_number } =
    useLocalSearchParams<{ mobile_number?: string }>();

  const initialMobileNumber = (raw_mobile_number || "")
    .replace(/\s/g, "")
    .startsWith("+") ? (raw_mobile_number || "").replace(/\s/g, "") : `+${(raw_mobile_number || "").replace(/\s/g, "")}`;

  const [formData, setFormData] = useState({
    name: "",
    email_id: "",
    mobile_number: initialMobileNumber || "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email_id: "",
    mobile_number: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Input change handler
  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" })); // clear error as user types
  };

  // ✅ Validation logic
  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email_id: "", mobile_number: "" };

    // Name validation
    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
      valid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email_id.trim()) {
      newErrors.email_id = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email_id)) {
      newErrors.email_id = "Invalid email address";
      valid = false;
    }

    // Mobile number validation
    const phoneRegex = /^\+91\d{10}$/; // Matches +91 followed by 10 digits
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
      valid = false;
    } else if (!phoneRegex.test(formData.mobile_number.replace(/\s/g, ""))) {
      newErrors.mobile_number = "Invalid phone number (e.g. +911234567890)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ✅ Submit handler
  const handleSignup = async () => {
    if (loading) return;

    // Validate the form before proceeding
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);

      const token = await getLoginJwtToken();
      if (!token) {
        Alert.alert("Authentication Error", "Login token not found. Please try logging in again.");
        setLoading(false);
        router.replace("/phoneLoginScreen");
        return;
      }

      const payload = {
        name: formData.name,
        email_id: formData.email_id,
        mobile_number: initialMobileNumber,
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch(
        "https://dev-backend-py-23809827867.us-east1.run.app/user/ph/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Role": "user", // default role
            Authorization: `Bearer ${token}`, // use the fetched token
            "X-Token-Source": "firebase", // or any appropriate value
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log("📥 Raw backend response:", text);

      if (!response.ok) {
        Alert.alert("Signup Failed", text || "Invalid input data");
        return;
      }

      // Fetch and save the newly created user's data
      await fetchAndSaveUser();

      router.replace("/(tabs)");

      setFormData({
        name: "",
        email_id: "",
        mobile_number: "",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 270, height: 270 }}
          />

          <Text style={styles.title}>Create an Account</Text>

          {/* Name Field */}
          <TextInput
            style={[styles.input, errors.name && styles.errorInput]}
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}

          {/* Email Field */}
          <TextInput
            style={[styles.input, errors.email_id && styles.errorInput]}
            placeholder="Email Address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email_id}
            onChangeText={(text) => handleChange("email_id", text)}
          />
          {errors.email_id ? (
            <Text style={styles.errorText}>{errors.email_id}</Text>
          ) : null}

          {/* Mobile Field */}
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Enter your mobile number"
            placeholderTextColor="#888"
            value={formData.mobile_number}
            editable={false}
          />
          {errors.mobile_number ? (
            <Text style={styles.errorText}>{errors.mobile_number}</Text>
          ) : null}

          {/* Submit Button */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={{ marginTop: 20 }}
            />
          ) : (
            <CustomButton
              title="Submit"
              backgroundColor="#4CAF50"
              onPress={handleSignup}
              style={{
                paddingHorizontal: 50,
                paddingVertical: 16,
                opacity: loading ? 0.7 : 1,
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#222",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },
  logo: {
    width: 350,
    height: 350,
    alignSelf: "center",
  },
  agreementText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#000", // normal text color
  },
  linkText: {
    color: "#4a90e2", // blue color
    textDecorationLine: "underline", // optional, for a link look
  },
});
