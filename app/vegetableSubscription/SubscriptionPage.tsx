import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SubscriptionPage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Vegetable Farming Subscription</Text>
      </View>

      {/* PLAN CARD */}
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Weekly Plan</Text>
        <Text style={styles.planPrice}>₹299 / week</Text>
        <Text style={styles.planDescription}>
          Receive hand-picked fresh vegetables every week.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✔ 100% organic vegetables</Text>
          <Text style={styles.feature}>✔ Direct from farm</Text>
          <Text style={styles.feature}>✔ Free doorstep delivery</Text>
          <Text style={styles.feature}>✔ Choose your weekly items</Text>
        </View>

        <TouchableOpacity style={styles.subscribeBtn}>
          <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
        </TouchableOpacity>
      </View>

      {/* MONTHLY PLAN */}
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Monthly Plan</Text>
        <Text style={styles.planPrice}>₹999 / month</Text>
        <Text style={styles.planDescription}>
          Save more with premium farm-to-home subscription.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✔ All weekly benefits</Text>
          <Text style={styles.feature}>✔ Priority delivery</Text>
          <Text style={styles.feature}>✔ Free extra seasonal veggies</Text>
          <Text style={styles.feature}>✔ Cancel anytime</Text>
        </View>

        <TouchableOpacity style={styles.subscribeBtn2}>
          <Text style={styles.subscribeBtnText}>Get Monthly Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
    marginTop: 30,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1B5E20",
  },
  planPrice: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#43A047",
    marginVertical: 8,
  },
  planDescription: {
    fontSize: 15,
    color: "#555",
    marginBottom: 15,
  },
  features: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 15,
    marginVertical: 3,
    color: "#2E7D32",
  },
  subscribeBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
  },
  subscribeBtn2: {
    backgroundColor: "#1B5E20",
    paddingVertical: 12,
    borderRadius: 10,
  },
  subscribeBtnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
