import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FarmingSubscriptionService } from "../api/farmingsubs";
import { AppEvents } from "../utils/eventEmitter";

export default function Subscription() {
  const { subscriptionId, duration_days, price } = useLocalSearchParams();
  const router = useRouter();

  const [duration, setDuration] = useState((duration_days as string) || "");
  const [currentPrice, setCurrentPrice] = useState((price as string) || "");

  const handleUpdateSubscription = async () => {
    if (!duration || !currentPrice) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const updated =
        await FarmingSubscriptionService.updateFarmingCourse(
          subscriptionId as string,
          {
            duration_days: duration,
            price: parseFloat(currentPrice),
          }
        );

      if (updated) {
        Alert.alert("Success", "Subscription updated successfully.");
        AppEvents.emit("refresh-subscriptions");
        router.back();
      } else {
        Alert.alert("Error", "Failed to update subscription.");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleCreateSubscription = async () => {
    if (!duration || !currentPrice) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const created =
        await FarmingSubscriptionService.createFarmingCourse({
          duration_days: duration,
          price: parseFloat(currentPrice),
        });

      if (created) {
        Alert.alert("Success", "Subscription created successfully.");
        setDuration("");
        setCurrentPrice("");
        AppEvents.emit("refresh-subscriptions");
        router.back();
      } else {
        Alert.alert("Error", "Failed to create subscription.");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleSave = () => {
    if (subscriptionId) {
      handleUpdateSubscription();
    } else {
      handleCreateSubscription();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: subscriptionId ? "Update Subscription" : "Create Subscription",
        }}
      />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (Days)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="Enter duration in days"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.priceInput}
              value={currentPrice}
              onChangeText={setCurrentPrice}
              keyboardType="numeric"
              placeholder="Enter price"
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
          >
            <Text style={styles.actionButtonText}>{subscriptionId ? "Update" : "Create Subscription"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#4B5563",
  },
  input: {
    height: 40,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  rupeeSymbol: {
    marginRight: 5,
    fontSize: 16,
    color: "#888",
  },
  priceInput: {
    flex: 1,
    height: 40,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});