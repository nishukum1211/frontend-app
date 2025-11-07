import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello NativeWind</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // full screen
    justifyContent: "center", // center vertically
    alignItems: "center", // center horizontally
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF", // iOS blue
  },
});
