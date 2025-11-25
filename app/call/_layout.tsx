import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { getUserData } from "../auth/action";

export default function CallLayout() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = await getUserData();
      if (user) {
        setUserRole(user.role);
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  if (loading) {
    return null; // Or a loading indicator
  }

  // If the user is an agent, do not render the CallLayout
  if (userRole === "agent") {
    return null;
  }

  return <Stack screenOptions={{ headerShown: true }} />;
}
