import { Stack } from "expo-router";

export default function AgentLayout() {
  return (
    <Stack>
      <Stack.Screen name="resources" options={{ title: "Resources" }} />
      <Stack.Screen
        name="viewItem"
        options={{
          title: "View Item",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
      <Stack.Screen
        name="updateItem"
        options={{
          title: "Edit Item",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
    </Stack>
  );
}
