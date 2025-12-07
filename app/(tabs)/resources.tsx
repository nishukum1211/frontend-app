import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getUserData } from "../auth/action";
import { DecodedToken } from "../auth/auth";
import AgentResources from "../agent/resources";
import PdfList from "./pdfList";

export default function Resources() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        setLoading(true);
        const userData = await getUserData();
        setUser(userData);
        setLoading(false);
      };
      loadUserData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {user?.role === "agent" ? <AgentResources /> : <PdfList />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    fontSize: 18,
    color: 'gray',
  },
});
