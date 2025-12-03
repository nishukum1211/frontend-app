import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./vegetableCoursesStyles";

interface CourseItem {
  id: string;
  crops: string;
  price: number;
}

const VegetableCoursesSection: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.row}>
              {/* Price */}
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.unit}>₹</Text>

              {/* Crop name */}
              <View style={styles.nameCard}>
                <Text style={styles.itemName}>{item.crops}</Text>
              </View>
            </View>

            <Text
              style={styles.subtitle}
              onPress={() => {
                router.push({
                  pathname: "./pdfCourse",
                  params: { id: item.id, price: item.price, crops: item.crops },
                });
              }}
            >
              PDF Course
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default VegetableCoursesSection;
