import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Course, CourseService } from "../api/course";

const CourseCard = ({
  item,
  onUpdate,
  onView,
}: {
  item: Course;
  onUpdate: () => void;
  onView: () => void;
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    CourseService.getCourseThumbnailUrl(item.id).then(setThumbnail);
  }, [item.id]);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onView}
      activeOpacity={0.8}
    >
      <Image
        source={
          thumbnail
            ? { uri: thumbnail }
            : require("../../assets/images/logo.png")
        }
        style={styles.thumbnail}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
          >
            <Text style={styles.buttonText}>✏️ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AgentCourses() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadCourses = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      setLoading(true);
    }
    const courses = await CourseService.listCourses();
    if (courses) {
      setItems(courses);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses(true);
  }, [loadCourses]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.placeholderText}>Loading courses...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderText}>No courses available.</Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.navigate("/agentResources/addCourse")}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            item={item}
            onUpdate={() =>
              router.navigate({
                pathname: "/agentResources/editCourse",
                params: {
                  courseId: item.id,
                },
              })
            }
            onView={() =>
              router.navigate({
                pathname: "/agentResources/editCourse",
                params: {
                  courseId: item.id,
                },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.navigate("/agentResources/addCourse")}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    paddingVertical: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
  itemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
  },
  itemDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  itemPrice: {
    fontSize: 18,
    color: "#059669",
    fontWeight: "bold",
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#007AFF",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: "white",
  },
});
