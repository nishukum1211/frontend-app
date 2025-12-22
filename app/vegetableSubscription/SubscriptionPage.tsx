import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SubscriptionPage: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Vegetable Farming</Text>
      <Text style={styles.subtitle}>Subscription</Text>

      <View style={styles.planRow}>
        {/* Left Plan */}
        <View style={styles.planBox}>
          <View style={styles.circle}>
            <Image
              source={require("../../assets/images/tomato.jpg")}
              style={styles.circleImage}
            />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹299</Text>
            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Plan */}
        <View style={styles.planBox}>
          <View style={styles.circle}>
            <Image
              source={require("../../assets/images/tomato.jpg")}
              style={styles.circleImage}
            />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹399</Text>
            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SubscriptionPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planBox: {
    width: "48%",
    alignItems: "center",
  },

  /* 🔴 IMPORTANT FIX HERE */
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    overflow: "hidden", // 👈 clips image to circle
  },

  circleText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#1B5E20",
  },

  priceRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    overflow: "hidden",
  },
  price: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#E8F5E9",
  },
  buyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#2E7D32",
  },
  buyText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* 🔴 FULL CIRCLE IMAGE */
  circleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // 👈 fills circle, no gaps
  },
});
