// app/_layout.tsx  (RootLayout)
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getUserData } from "./auth/action";
import { addAuthChangeListener, DecodedToken, removeAuthChangeListener } from "./auth/auth";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await getUserData();
      setUser(storedUser);
      setInitializing(false);
    };
    checkUser();
  }, []);

  useEffect(() => {
    // Listen for auth changes
    const handleAuthChange = (newUser: DecodedToken | null) => {
      setUser(newUser);
    };
    addAuthChangeListener(handleAuthChange);

    return () => removeAuthChangeListener(handleAuthChange);
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  if (initializing) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? ( // Screens for logged-in users
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/agentChatDetail" options={{ headerShown: true }} />
          </>
        ) : ( // Screens for logged-out users
          <>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="adminLogin" options={{ headerShown: false }} />
            <Stack.Screen
              name="phoneLoginScreen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AgentDetails"
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack>
    </SafeAreaProvider>
  );
}