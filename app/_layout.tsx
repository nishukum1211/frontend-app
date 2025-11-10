import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./components/screens/LoginScreen";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status (this is a placeholder, replace with actual logic)
    const userLoggedIn = false; // Set to true for testing
    setIsLoggedIn(userLoggedIn);
  }, []);

  // If the user is not logged in, render the Login screen directly instead of
  // attempting to navigate. This avoids calling navigation before the root
  // navigator has mounted.
  if (!isLoggedIn) {
    return <LoginScreen onClose={() => setIsLoggedIn(true)} />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
