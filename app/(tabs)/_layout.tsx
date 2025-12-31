// TabsLayout.tsx
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserData } from "../auth/action";
import { DecodedToken } from "../auth/auth";
import CameraScreen from "../components/camera";
import FarmingSubscription from "../farmingSubscription/main";

export function Subscription() {
  return <FarmingSubscription />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    const loadIconFonts = async () => {
      try {
        const loaders: Promise<void>[] = [];
        if ((FontAwesome as any).loadFont)
          loaders.push((FontAwesome as any).loadFont());
        if ((FontAwesome5 as any).loadFont)
          loaders.push((FontAwesome5 as any).loadFont());
        if ((Ionicons as any).loadFont)
          loaders.push((Ionicons as any).loadFont());
        if ((MaterialCommunityIcons as any).loadFont)
          loaders.push((MaterialCommunityIcons as any).loadFont());
        await Promise.all(loaders);
      } catch (err) {
        console.warn("Failed to load icon fonts", err);
      } finally {
        setFontsLoaded(true);
      }
    };
    loadIconFonts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUserData().then(setUser);
    }, [])
  );

  const handlePictureTaken = (uri: string) => {
    setCameraOpen(false);
    router.push({
      pathname: "/(tabs)/chat",
      params: { image_uri: uri },
    });
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8E8E93",
          headerShown: true,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E5EA",
            height: Platform.OS === "ios" ? 86 : 60 + insets.bottom,
            paddingBottom: Platform.OS === "ios" ? 10 : insets.bottom + 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="subscription"
          options={{
            title: "Subscription",
            tabBarLabel: "Subscription",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clipboard-list"
                size={size}
                color={color}
              />
            ),
            href:
              user?.role?.trim().toLowerCase() === "agent" ? "/subscription" : null,
          }}
        />

        <Tabs.Screen
          name="courses"
          options={{
            title: "Courses",
            tabBarLabel: "Courses",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="book-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="camera"
          options={{
            title: "Camera",
            tabBarLabel: "Camera",
            href:
              user?.role?.trim().toLowerCase() === "agent" ? null : "/camera",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="camera" size={size} color={color} />
            ),
          }}
        />



        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarLabel: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="pdfList" options={{ href: null }} />
      </Tabs>

      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraOpen}
        onRequestClose={() => setCameraOpen(false)}
      >
        <CameraScreen
          handleClose={() => setCameraOpen(false)}
          onPictureTaken={handlePictureTaken}
        />
      </Modal>
    </View>
  );
}


