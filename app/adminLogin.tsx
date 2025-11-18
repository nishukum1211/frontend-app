import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AgentLogin() {
  const router = useRouter();
  const [mobile_number, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
            mobile_number,
            password,
          }),
        }
      );

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok && data.token) {
        // Decode the JWT token to read user info or expiry
        const decoded = jwtDecode(data.token);
        console.log("Decoded Token:", decoded);

        // Save token securely
        await SecureStore.setItemAsync("agentToken", data.token);
        await SecureStore.setItemAsync("agentData", JSON.stringify(decoded));
        router.replace("./(tabs)");

        Alert.alert("Login Success", "You are logged in as agent.");
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

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Agent Login
      </Text>

      <TextInput
        placeholder="+91XXXXXXXXXX"
        value={mobile_number}
        keyboardType="phone-pad"
        onChangeText={setMobileNumber}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "#007bff",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "white", fontWeight: "bold" }}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
