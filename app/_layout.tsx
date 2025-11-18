// app/_layout.tsx  (RootLayout)
import { auth } from "@/app/firebaseConfig";
import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
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

// import { Redirect, Stack } from "expo-router";
// import { onAuthStateChanged, User } from "firebase/auth";
// import { useEffect, useState } from "react";
// import { auth } from "./firebaseConfig";

// export default function RootLayout() {
//   const [initializing, setInitializing] = useState(true);
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (u) => {
//       setUser(u); // now TypeScript accepts this
//       setInitializing(false);
//     });

//     return unsubscribe;
//   }, []);

//   if (initializing) return null;

//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false }} />

//       {!user ? (
//         <Redirect href="/phoneLoginScreen" />
//       ) : (
//         <Redirect href="/(tabs)" />
//       )}
//     </>
//   );
// }
