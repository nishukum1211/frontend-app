import { Stack } from "expo-router";

export default function AgentLayout() {
  return (
    <Stack>
      <Stack.Screen name="resources" options={{ title: "Resources" }} />
      <Stack.Screen name="updateItem" options={{ title: "Details" }} />
    </Stack>
  );
}
