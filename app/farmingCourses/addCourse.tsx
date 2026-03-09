import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FarmingCourseFormData,
  FarmingCourseService,
} from "../api/farmingCourse";
import FarmingCourseForm from "./components/FarmingCourseForm";
import { FarmingCourseFormValues } from "./components/types";
import { useState } from "react";

export default function AddFarmingCourseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: FarmingCourseFormValues) => {
    setLoading(true);
    const payload: FarmingCourseFormData = {
      cropName: values.cropName,
      price: values.price,
      duration_days: values.duration_days,
      thumbnail: values.thumbnailFile as any,
    };

    const response = await FarmingCourseService.createFarmingCourse(payload);
    setLoading(false);

    if (!response) {
      Alert.alert("Error", "Unable to create farming course.");
      return;
    }

    Alert.alert("Success", "Farming course created.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Create Farming Course</Text>
        <FarmingCourseForm submitLabel="Create Course" loading={loading} onSubmit={onSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    marginHorizontal: 14,
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
});
