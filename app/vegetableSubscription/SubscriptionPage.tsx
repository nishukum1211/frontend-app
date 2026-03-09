import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchAndCacheBlobFile } from "../api/common";
import {
  FarmingCourseService,
  FarmingSubscriptionResponse,
} from "../api/farmingCourse";

function CourseItem({
  course,
  onBuy,
}: {
  course: FarmingSubscriptionResponse;
  onBuy: () => void;
}) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingThumb, setLoadingThumb] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (course.thumbnail) {
      setLoadingThumb(true);
      fetchAndCacheBlobFile(course.thumbnail).then((uri) => {
        if (mounted) {
          setThumbnailUri(uri);
          setLoadingThumb(false);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [course.thumbnail]);

  const isActive = course.active;

  return (
    <View style={[styles.planBox, isActive && styles.planBoxGray]}>
      <View style={[styles.circle, isActive && styles.circleGray]}>
        {loadingThumb ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Image
            source={
              thumbnailUri
                ? { uri: thumbnailUri }
                : require("../../assets/images/logo.png")
            }
            style={[styles.circleImage, isActive && styles.circleImageGray]}
          />
        )}
        {isActive && (
          <View style={styles.purchasedOverlay}>
            <Text style={styles.purchasedIcon}>✅</Text>
          </View>
        )}
      </View>
      {isActive ? (
        <View style={styles.purchasedBadge}>
          <Text style={styles.purchasedText}>Purchased</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.buyBtn} onPress={onBuy}>
          <Text style={styles.buyText}>Join Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const SubscriptionPage: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<FarmingSubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const list = await FarmingCourseService.getFarmingSubscriptionsForUser();
    setCourses(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleBuyNow = async (course: FarmingSubscriptionResponse) => {
    const details = await FarmingCourseService.getFarmingCourseDetails(
      course.id
    );
    router.push({
      pathname: "/farmingCourses/viewCourse",
      params: {
        id: course.id,
        crops: course.cropName,
        price: details ? String(details.price) : "0",
        duration_days: details ? String(details.duration_days) : "30",
        content: details ? JSON.stringify(details.content) : "[]",
      },
    } as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Vegetable Farming</Text>
      <Text style={styles.subtitle}>Subscription</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginVertical: 30 }}
        />
      ) : (
        <View style={styles.planRow}>
          {courses.map((course) => (
            <CourseItem
              key={course.id}
              course={course}
              onBuy={() => handleBuyNow(course)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default SubscriptionPage;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F5F5",
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E7D32",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  planRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  planBox: {
    width: "44%",
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  circleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#1B5E20",
    marginBottom: 8,
  },
  buyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
  },
  buyText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  planBoxGray: {
    opacity: 0.6,
  },
  circleGray: {
    borderColor: "#999",
  },
  circleImageGray: {
    opacity: 0.5,
  },
  purchasedOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  purchasedIcon: {
    fontSize: 32,
  },
  purchasedBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#999",
    borderRadius: 8,
  },
  purchasedText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
