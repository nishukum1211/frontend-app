import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "../../api/user";

interface FarmingUserCardProps {
  user: User;
  status?: string;
}

export default function FarmingUserCard({ user, status }: FarmingUserCardProps) {
  const onCall = () => {
    Linking.openURL(`tel:${user.mobile_number.replace(/\s/g, "")}`);
  };

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>{user.mobile_number}</Text>
        {status ? <Text style={styles.status}>Status: {status}</Text> : null}
      </View>

      <TouchableOpacity style={styles.callBtn} onPress={onCall}>
        <Text style={styles.callText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  name: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16,
  },
  phone: {
    marginTop: 2,
    color: "#334155",
    fontSize: 14,
  },
  status: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 12,
  },
  callBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  callText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
