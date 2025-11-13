import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type DecodedToken = {
  id: string;
  name: string;
  email_id: string;
  mobile_number: string;
  role: string;
  exp?: number;
};

export default function Profile() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Load token if already logged in
  useFocusEffect(
    useCallback(() => {
      const loadToken = async () => {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            setUser(decoded);
            setIsLoggedIn(true);
          } catch (err) {
            console.log("Invalid token");
            await AsyncStorage.removeItem("jwtToken");
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      };
      loadToken();
    }, [])
  );

  // 📦 Helper function to call backend
  const apiCall = async (url: string, body: any) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem("jwtToken", data.token);
        const decoded: DecodedToken = jwtDecode(data.token);
        setUser(decoded);
        setIsLoggedIn(true);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🛠 Admin Login Button
  const handleAdminLogin = async () => {
    await apiCall("https://your-backend.com/api/admin/login", {
      email: "admin@gmail.com",
      password: "admin123",
    });
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("jwtToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  // 📸 Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🧭 Show Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Processing...</Text>
      </View>
    );
  }

  // 🚪 If not logged in: show buttons
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Profile Page</Text>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.replace("../login")}
        >
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => router.replace("../signup")}
        >
          <Text style={styles.authButtonText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin}>
          <Text style={styles.authButtonText}>Admin Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ After Login
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
        <Image
          source={
            image ? { uri: image } : require("@/assets/images/profile_img.jpg")
          }
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email_id}</Text>

        <Text style={styles.label}>Mobile Number</Text>
        <Text style={styles.value}>{user?.mobile_number}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  changePhotoText: {
    color: "#007AFF",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  infoBox: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
    elevation: 4,
  },
  label: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 10,
  },
  value: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  editButton: {
    marginTop: 40,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  authButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
  },
  adminButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
