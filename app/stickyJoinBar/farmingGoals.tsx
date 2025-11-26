import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PointItemProps {
  text: string;
}

const PointItem: React.FC<PointItemProps> = ({ text }) => {
  return (
    <View style={styles.pointContainer}>
      <Ionicons name="checkmark-circle" size={20} color="#fff" />
      <Text style={styles.pointText}>{text}</Text>
    </View>
  );
};

export default function FarmingGoalsSection() {
  const points = [
    "खाद और दवाइयों का पूरा शेड्यूल",
    "कीट–रोग की पहचान और असरदार समाधान",
    "कीट–रोग की पहचान और असरदार समाधान",
    "कीट–रोग की पहचान और असरदार समाधान",
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>PDF में आपको क्या-क्या मिलेगा ?</Text>

      {points.map((item, index) => (
        <View key={index} style={styles.card}>
          <PointItem text={item} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  pointContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    flexShrink: 1,
  },
});
