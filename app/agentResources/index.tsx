import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  onToggleStatus,
}: {
  item: Course;
  onUpdate: () => void;
  onView: () => void;
  onToggleStatus: () => void;
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    CourseService.getCourseThumbnailUrl(item.id).then(setThumbnail);
  }, [item.id]);

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onUpdate}
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
            style={[
              styles.statusButton,
              item.live ? styles.statusLive : styles.statusOffline,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
          >
            <Text
              style={[
                styles.statusText,
                item.live ? styles.textLive : styles.textOffline,
              ]}
            >
              {item.live ? "Live" : "Offline"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.usersButton}
            onPress={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Text style={styles.buttonText}>👥 Users</Text>
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

  const handleToggleStatus = (item: Course) => {
    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to make this course ${item.live ? "offline" : "live"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              if (item.live) {
                await CourseService.goDown(item.id);
              } else {
                await CourseService.goLive(item.id);
              }
              loadCourses(true);
            } catch (error) {
              console.error("Failed to toggle status", error);
            }
          },
        },
      ]
    );
  };

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
                pathname: "/agentResources/course_subs",
                params: {
                  item: JSON.stringify({
                    id: item.id,
                    name: item.title,
                    price: item.price,
                  }),
                },
              })
            }
            onToggleStatus={() => handleToggleStatus(item)}
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
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  usersButton: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  statusButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  statusOffline: {
    backgroundColor: "#F3F4F6",
    borderColor: "#9CA3AF",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textLive: {
    color: "#15803D",
  },
  textOffline: {
    color: "#4B5563",
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
