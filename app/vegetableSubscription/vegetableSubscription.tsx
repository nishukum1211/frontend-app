import { Image, Text, View } from "react-native";
import styles from "./vegetableStyles";

export default function VegetableSubscription() {
  return (
    <View style={styles.card}>
      {/* TOP IMAGES ROW */}
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

      {/* TITLE */}
      <Text style={styles.title}>Vegetable Farming</Text>

      {/* SUBSCRIPTION BADGE */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Subscription</Text>
      </View>
    </View>
  );
}
