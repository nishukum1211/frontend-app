// TabsLayout.tsx
import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

/**
 * Tabs layout:
 * - Explicitly load icon fonts using each icon set's .loadFont()
 * - Center floating camera tab button that opens the camera via expo-image-picker
 * - Profile route is hidden from tab bar (navigable by header)
 */

export default function TabsLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Load all icon fonts used in the app.
    const loadIconFonts = async () => {
      try {
        // Each icon set exposes a loadFont function when using @expo/vector-icons
        // (this returns a promise)
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

  // Don't render tabs until fonts are loaded (prevents glyphs missing)
  if (!fontsLoaded) return null;

  // Camera action when center tab pressed
  const openCameraFromTab = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Camera permission is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        console.log("Captured Image URI:", result.assets[0].uri);
        // TODO: handle the captured image (upload / navigate / etc.)
      }
    } catch (err) {
      console.warn("Failed to open camera:", err);
    }
  };

  // Custom floating camera tab button
  const CameraTabButton = ({ children, onPress, accessibilityState }: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        top: -5,
        justifyContent: "center",
        alignItems: "center",
        width: 90,
      }}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      <View
        style={{
          width: 66,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </View>

      {/* Label Below Camera Icon */}
      <Text
        style={{
          marginTop: -12,
          fontSize: 10,
          color: accessibilityState?.selected ? "#007AFF" : "#8E8E93",
        }}
      >
        Camera
      </Text>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          height: Platform.OS === "ios" ? 86 : 64,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
        },
      }}
    >
      {/* Home */}
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

      {/* Center Camera Button (no label, custom button opens camera) */}
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarLabel: "Camera",
          tabBarButton: (props) => (
            <CameraTabButton
              onPress={openCameraFromTab}
              accessibilityState={props.accessibilityState}
            >
              <MaterialCommunityIcons name="camera" size={30} color="gray" />
            </CameraTabButton>
          ),
        }}
      />

      {/* Resources */}
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarLabel: "Resources",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="book" size={size} color={color} />
          ),
        }}
      />

      {/* Chat */}
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

      {/* Profile route kept but hidden from tab bar (navigable from header) */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // hides from tab bar
        }}
      />

      {/* Hidden navigable screens */}
      <Tabs.Screen name="pdfList" options={{ href: null }} />
      <Tabs.Screen name="pdfCourse" options={{ href: null }} />
    </Tabs>
  );
}
