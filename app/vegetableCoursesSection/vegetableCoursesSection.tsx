import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import styles from "./vegetableCoursesStyles";

interface CourseItem {
  id: string;
  name: string;
  price: number;
}

const courses: CourseItem[] = [
  { id: "1", name: "खीरा", price: 149 },
  { id: "2", name: "टमाटर", price: 249 },
  { id: "3", name: "मिर्ची", price: 199 },
  { id: "4", name: "बैंगन", price: 249 },
];

const VegetableCoursesSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            {/* Row: price → मात्र → > → item name (inside small card) */}
            <View style={styles.row}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.unit}>मात्र</Text>

              {/* Small card for item name */}
              <View style={styles.nameCard}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            </View>

            {/* PDF Course (second line) */}
            <Text style={styles.subtitle}>PDF Course</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default VegetableCoursesSection;
