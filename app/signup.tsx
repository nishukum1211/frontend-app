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
} from "react-native";
import CustomButton from "./components/Button";

export default function Signup() {
  const router = useRouter(); // ✅ Move it here (top-level)
  const [formData, setFormData] = useState({
    name: "",
    email_id: "",
    password: "",
    mobile_number: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email_id: "",
    password: "",
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
    let newErrors = { name: "", email_id: "", password: "", mobile_number: "" };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    // Mobile number validation
    const phoneRegex = /^\+[1-9]\d{7,14}$/; // E.164 format (+91xxxxxxxxxx)
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
      valid = false;
    } else if (!phoneRegex.test(formData.mobile_number)) {
      newErrors.mobile_number = "Invalid phone number (e.g. +911234567890)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ✅ Submit handler
  const handleSignup = async () => {
    if (loading) return;

    // Basic front-end validation
    if (!formData.name || formData.name.length < 2) {
      Alert.alert("Invalid name", "Name must be at least 2 characters long");
      return;
    }
    if (!formData.email_id) {
      Alert.alert("Invalid email", "Email is required");
      return;
    }
    if (!/^\+91\d{10}$/.test(formData.mobile_number)) {
      Alert.alert(
        "Invalid number",
        "Mobile number must be in +91XXXXXXXXXX format"
      );
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      Alert.alert(
        "Invalid password",
        "Password must be at least 8 characters long"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email_id: formData.email_id,
        mobile_number: formData.mobile_number,
        password: formData.password,
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch(
        "https://dev-backend-py-23809827867.us-east1.run.app/user/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log("📥 Raw backend response:", text);

      if (!response.ok) {
        Alert.alert("Signup Failed", text || "Invalid input data");
        return;
      }

      router.replace("/login");

      setFormData({
        name: "",
        email_id: "",
        password: "",
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
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

        {/* Password Field */}
        <TextInput
          style={[styles.input, errors.password && styles.errorInput]}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
        />
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        {/* Mobile Field */}
        <TextInput
          style={[styles.input, errors.mobile_number && styles.errorInput]}
          placeholder="Mobile Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={formData.mobile_number}
          onChangeText={(text) => handleChange("mobile_number", text)}
        />
        {errors.mobile_number ? (
          <Text style={styles.errorText}>{errors.mobile_number}</Text>
        ) : null}

        {/* Submit Button */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007bff"
            style={{ marginTop: 20 }}
          />
        ) : (
          <CustomButton
            title="Submit"
            backgroundColor="#007bff"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
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
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },
});
