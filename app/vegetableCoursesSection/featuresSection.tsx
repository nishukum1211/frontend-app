import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const FeaturesSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Feature 1 */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="calendar-refresh"
              size={30}
              color="#fff"
            />
          </View>
          <Text style={styles.label}>Monthly Updates</Text>
        </View>

        {/* Feature 2 */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="infinity" size={26} color="#fff" />
          </View>
          <Text style={styles.label}>Lifetime Access</Text>
        </View>

        {/* Feature 3 */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="headset" size={28} color="#fff" />
          </View>
          <Text style={styles.label}>Call Suggestion</Text>
        </View>

        {/* Feature 4 */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="autorenew" size={28} color="#fff" />
          </View>
          <Text style={styles.label}>7-Day Refund</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    paddingBottom: 80,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#e8ffd4",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // <-- fixes text overflow
  },

  iconCircle: {
    width: 42,
    height: 42,
    backgroundColor: "#0b5c37",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    flexShrink: 1, // <-- prevents overflow
    fontSize: 15,
    fontWeight: "600",
    color: "#183d18",
  },
});

export default FeaturesSection;
