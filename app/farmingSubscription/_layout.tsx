import { Stack } from "expo-router";

export default function FarmingSubscriptionLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="main"
        options={{ title: "Farming Subscriptions" }}
      />
      <Stack.Screen name="update" options={{ title: "Subscription" }} />
      <Stack.Screen name="subscriptionList" options={{ title: "Subscription List" }} />
    </Stack>
  );
}
