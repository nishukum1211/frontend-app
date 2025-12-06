import { StyleSheet, Text, View } from "react-native";

export default function AgentResources() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Agent resources will be available here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  placeholderText: {
    fontSize: 18,
    color: "gray",
  },
});
