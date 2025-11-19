import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getUserData, removeLoginJwtToken, removeUserData } from "../auth";

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
  const [loading, setLoading] = useState(true);

  // ✅ Load user data from SecureStore
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        setLoading(true);
        // getUserData now handles fetching if no local user data but a token exists
        const userFromAuth = await getUserData();
        setUser(userFromAuth);
        setLoading(false);
      };
      loadUserData();
    }, [])
  );

  //  Logout
  const handleLogout = async () => {
    await removeUserData();
    await removeLoginJwtToken();
    setUser(null);
    // Optionally, navigate away or show a confirmation
    router.replace("../(tabs)/profile");
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
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  // 🚪 If not logged in: show buttons
  if (!user) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push("../phoneLoginScreen")}
          >
            <Text style={styles.authButtonText}>User Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push("../adminLogin")}
          >
            <Text style={styles.authButtonText}>Agent Login</Text>
          </TouchableOpacity>
        </View>
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

        {/* {user?.role !== "agent" && (
          <>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role}</Text>
          </>
        )} */}
      </View>

      {user?.role === "agent" && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push("../agentForm/agentUploadForm")}
        >
          <Text style={styles.uploadButtonText}>Upload PDF / Sell Item</Text>
        </TouchableOpacity>
      )}

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
  logo: {
    width: 260,
    height: 260,
    marginBottom: 20,
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
    marginTop: 15,
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
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  adminButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  uploadButton: {
    marginTop: 20,
    backgroundColor: "#10B981", // green
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
});
