import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FarmingCourseService } from "../api/farmingCourse";
import FarmingCourseCard from "./components/FarmingCourseCard";
import { FarmingCourseListItem } from "./components/types";

export default function FarmingCoursesHome() {
  const router = useRouter();
  const [courses, setCourses] = useState<FarmingCourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = useCallback(async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    const list = await FarmingCourseService.getAllFarmingCourses();
    setCourses(Array.isArray(list) ? (list as FarmingCourseListItem[]) : []);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  const toggleStatus = (item: FarmingCourseListItem) => {
    const isLive = Boolean(item.live);
    Alert.alert(
      "Confirm",
      `Make this farming course ${isLive ? "offline" : "live"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            const response = isLive
              ? await FarmingCourseService.takeFarmingCourseDown(item.id)
              : await FarmingCourseService.makeFarmingCourseLive(item.id);

            if (!response) {
              Alert.alert("Error", "Unable to update course status.");
              return;
            }

            loadCourses(true);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0E7490" />
        <Text style={styles.helper}>Loading farming courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadCourses(true);
            }}
            colors={["#0E7490"]}
          />
        }
        ListEmptyComponent={<Text style={styles.helper}>No farming courses found.</Text>}
        renderItem={({ item }) => (
          <FarmingCourseCard
            item={item}
            onEdit={() =>
              router.push({
                pathname: "/farmingCourses/editCourse" as any,
                params: { courseId: item.id },
              })
            }
            onUsers={() =>
              router.push({
                pathname: "/farmingCourses/course_subs" as any,
                params: {
                  courseId: item.id,
                  cropName: item.cropName,
                  price: String(item.price ?? 0),
                },
              })
            }
            onToggleStatus={() => toggleStatus(item)}
          />
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/farmingCourses/addCourse" as any)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  helper: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#0E7490",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 28,
    marginTop: -2,
  },
});
