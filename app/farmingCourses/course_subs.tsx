import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FarmingCourseService,
  UserResponse,
} from "../api/farmingCourse";
import FarmingAddUserModal from "./components/FarmingAddUserModal";
import FarmingUserCard from "./components/FarmingUserCard";

export default function FarmingSubscribersScreen() {
  const params = useLocalSearchParams<{
    courseId: string;
    cropName?: string;
    price?: string;
  }>();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const courseId = params.courseId;
  const price = useMemo(() => Number(params.price ?? 0), [params.price]);

  const loadUsers = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const response = await FarmingCourseService.fetchUsersFarmingCourses(courseId);
    const nextUsers = Array.isArray(response)
      ? response.filter(
          (user, index, source) => index === source.findIndex((target) => target.id === user.id)
        )
      : [];
    setUsers(nextUsers);
    setLoading(false);
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{params.cropName || "Course Users"}</Text>
          <Text style={styles.subTitle}>Total Users: {users.length}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0E7490" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FarmingUserCard user={item} status={item.farmingCourseStatus} />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found for this course.</Text>}
        />
      )}

      <FarmingAddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        courseId={courseId}
        price={price}
        onAdded={loadUsers}
        onCreateOfflineSubscription={FarmingCourseService.createOfflineFarmingCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  subTitle: {
    marginTop: 3,
    color: "#64748B",
  },
  addBtn: {
    backgroundColor: "#0E7490",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    color: "#64748B",
  },
});
