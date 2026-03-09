import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function FarmingSubscriptionLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Farming Courses" }} />
        <Stack.Screen name="addCourse" options={{ title: "Create Farming Course", presentation: "modal" }} />
        <Stack.Screen name="editCourse" options={{ title: "Edit Farming Course" }} />
        <Stack.Screen name="viewCourse" options={{ title: "View Course", headerShown: false }} />
        <Stack.Screen name="course_subs" options={{ title: "Course Users" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
