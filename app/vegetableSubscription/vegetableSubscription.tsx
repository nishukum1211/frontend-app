import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styles from "./vegetableStyles";

export default function VegetableSubscription() {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.imageRow}>
        <Image
          source={require("../../assets/images/chilli.webp")}
          style={styles.vegImage}
        />
        <Image
          source={require("../../assets/images/cucumber.jpg")}
          style={styles.vegImage}
        />
        <Image
          source={require("../../assets/images/brinjal.webp")}
          style={styles.vegImage}
        />
        <Image
          source={require("../../assets/images/tomato.jpg")}
          style={styles.vegImage}
        />
      </View>

      <Text style={styles.title}>Vegetable Farming</Text>

      <TouchableOpacity
        style={styles.badge}
        onPress={() => router.push("/vegetableSubscription/SubscriptionPage")}
      >
        <Text style={styles.badgeText}>Subscription</Text>
      </TouchableOpacity>
    </View>
  );
}
