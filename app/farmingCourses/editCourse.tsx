import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FarmingCourseDetailsResponse,
  FarmingCourseService,
  FarmingCourseUpdateFormData,
} from "../api/farmingCourse";
import FarmingContentEditor from "./components/FarmingContentEditor";
import FarmingCourseForm from "./components/FarmingCourseForm";
import { FarmingContentItem, FarmingCourseDetails, FarmingCourseFormValues } from "./components/types";

function toDetails(data: FarmingCourseDetailsResponse): FarmingCourseDetails {
  return {
    id: data.id,
    cropName: data.cropName,
    price: data.price,
    duration_days: data.duration_days,
    live: data.live,
    thumbnail: data.thumbnail,
    content: Array.isArray(data.content) ? data.content : [],
  };
}

export default function EditFarmingCourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);
  const [details, setDetails] = useState<FarmingCourseDetails | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [liveContent, setLiveContent] = useState<FarmingContentItem[]>([]);

  const load = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const response = await FarmingCourseService.getFarmingCourseDetails(courseId);
    if (!response) {
      Alert.alert("Error", "Unable to fetch course details.");
      setLoading(false);
      return;
    }

    setDetails(toDetails(response));
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateMeta = async (values: FarmingCourseFormValues) => {
    if (!courseId) return;

    setSavingMeta(true);
    const payload: FarmingCourseUpdateFormData = {
      cropName: values.cropName,
      price: values.price,
      duration_days: values.duration_days,
      thumbnail: values.thumbnailFile as any,
    };

    const updated = await FarmingCourseService.updateFarmingCourse(courseId, payload);
    setSavingMeta(false);

    if (!updated) {
      Alert.alert("Error", "Unable to update course details.");
      return;
    }

    Alert.alert("Success", "Course details updated.");
    setIsEditingDetails(false);
    load();
  };

  const handleView = useCallback(() => {
    if (!details) return;
    router.push({
      pathname: "/farmingCourses/viewCourse",
      params: {
        id: details.id,
        crops: details.cropName,
        price: String(details.price),
        duration_days: String(details.duration_days),
        content: JSON.stringify(liveContent),
      },
    } as any);
  }, [details, liveContent, router]);

  // Set header buttons: Save (content) + View
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleView}
            style={headerStyles.viewBtn}
          >
            <Text style={headerStyles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleView]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.center}>
        <Text style={styles.helper}>Course not found.</Text>
      </View>
    );
  }

  return (
    <FarmingContentEditor
      courseId={details.id}
      initialContent={details.content}
      onPersisted={(content) => {
        setDetails((prev) => (prev ? { ...prev, content } : prev));
      }}
      onContentChange={setLiveContent}
      listHeaderComponent={
        <View>
          {/* ── Details Section ── */}
          <View style={styles.detailsHeader}>
            <Text style={styles.sectionTitle}>Course Details</Text>
            <TouchableOpacity onPress={() => setIsEditingDetails((prev) => !prev)}>
              <Text style={styles.editToggle}>
                {isEditingDetails ? "Cancel" : "✏️ Edit"}
              </Text>
            </TouchableOpacity>
          </View>
          <FarmingCourseForm
            initialValues={{
              cropName: details.cropName,
              price: details.price,
              duration_days: details.duration_days,
            }}
            submitLabel="Save Details"
            loading={savingMeta}
            editable={isEditingDetails}
            onSubmit={handleUpdateMeta}
          />

          {/* ── Content Section Header ── */}
          <View style={styles.contentHeader}>
            <Text style={styles.sectionTitle}>Content</Text>
          </View>
        </View>
      }
    />
  );
}

const headerStyles = StyleSheet.create({
  viewBtn: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
  },
  viewText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  helper: {
    color: "#64748B",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  editToggle: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
    padding: 8,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 20,
    marginBottom: 8,
  },
});
