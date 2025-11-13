import { auth } from "@/app/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);

  // 👇 Run auth check every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return unsubscribe;
    }, [])
  );

  // ✅ Dynamically update header
  useEffect(() => {
    navigation.setOptions({
      title: "Home",
      headerRight: () =>
        !user ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("login" as never)}
            style={{ marginRight: 15 }}
          >
            <MaterialCommunityIcons
              name="account-arrow-right"
              size={28}
              color="#007AFF"
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Home Screen</Text>
      {user ? (
        <Text style={{ marginTop: 10, color: "green" }}>
          👋 Welcome, {user.phoneNumber || "User"}!
        </Text>
      ) : (
        <Text style={{ marginTop: 10, color: "gray" }}>Please log in</Text>
      )}
    </View>
  );
}
