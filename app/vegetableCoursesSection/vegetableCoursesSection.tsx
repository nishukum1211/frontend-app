import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CourseService, CourseUser } from "../api/course";
import styles from "./vegetableCoursesStyles";

const VegetableCoursesSection: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const items = await CourseService.listUserCourses();
      if (items) {
        setCourses(items);
      }
      setLoading(false);
    };
    fetchCourses().catch((err) => {
      console.error("Failed to fetch vegetable courses:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={[
                styles.card,
                item.active && { backgroundColor: "#E5E7EB", elevation: 0 },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/vegetableCoursesSection/pdfCourse",
                  params: {
                    ...item,
                    content: JSON.stringify(item.content),
                    active: item.active.toString(), // Convert boolean to string
                  },
                })
              }
            >
              <View style={styles.row}>
                {/* Price */}
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.unit}>₹</Text>

                {/* Crop name */}
                <View style={styles.nameCard}>
                  <Text style={styles.itemName}>{item.crop}</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>PDF Course</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default VegetableCoursesSection;
