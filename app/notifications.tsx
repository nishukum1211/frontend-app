import { FontAwesome } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View } from "react-native";

const dummyNotifications = [
  {
    id: "1",
    title: "New Message",
    description: "You have a new message",
    time: "5m ago",
  },
  {
    id: "2",
    title: "Reminder",
    description: "Meeting in 30 minutes",
    time: "30m ago",
  },
  {
    id: "3",
    title: "Update Available",
    description: "New app version available",
    time: "1h ago",
  },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <FontAwesome
              name="bell-o"
              size={24}
              color="#007AFF"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
