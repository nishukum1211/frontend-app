import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function CourseLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Courses" }} />
        <Stack.Screen name="addCourse" options={{ title: "Add Course", presentation: "modal" }} />
        <Stack.Screen name="editCourse" options={{ title: "Edit Course", presentation: "modal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
