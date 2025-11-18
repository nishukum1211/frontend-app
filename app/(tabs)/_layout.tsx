import { auth } from "@/app/firebaseConfig";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";

export default function TabsLayout() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  // Listen for auth changes globally
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "",
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
        },

        // 👇 GLOBAL HEADER LEFT (same for all screens)
        headerLeft: () =>
          user ? (
            <TouchableOpacity
              onPress={() => router.navigate("/profile/profile")}
              style={{ marginLeft: 15 }}
            >
              <MaterialCommunityIcons
                name="account-circle"
                size={30}
                color="#007AFF"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={{ marginLeft: 15 }}>
              <MaterialCommunityIcons
                name="account-arrow-right"
                size={30}
                color="#007AFF"
              />
            </TouchableOpacity>
          ),

        // 👇 GLOBAL HEADER RIGHT (always shows logo)
        headerRight: () => (
          <Image
            source={require("../../assets/images/logo.png")}
            style={{
              width: 130,
              height: 100,
              resizeMode: "contain",
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
