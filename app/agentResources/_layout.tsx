import { Stack } from "expo-router";

export default function AgentLayout() {
  return (
    <Stack>
      <Stack.Screen name="resources" options={{ title: "Resources" }} />
       <Stack.Screen name="viewItem" options={{ title: "View Item" }} /> 
      <Stack.Screen name="updateItem" options={{ title: "Edit Item" }} />
    </Stack>
  );
}
