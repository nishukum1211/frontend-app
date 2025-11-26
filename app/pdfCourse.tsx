// import { useLocalSearchParams } from "expo-router";
// import { useEffect, useState } from "react";
// import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
// import styles from "../vegetableCoursesSection/pdfCourseStyles";

// interface PdfItem {
//   id: number;
//   name: string;
//   price: number;
// }

// const PdfCourse = () => {
//   const { id } = useLocalSearchParams(); // item id from previous screen
//   const [item, setItem] = useState<PdfItem | null>(null);

//   useEffect(() => {
//     fetch("https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item")
//       .then((res) => res.json())
//       .then((data: PdfItem[]) => {
//         const selectedItem = data.find((pdf) => String(pdf.id) === String(id));

//         setItem(selectedItem || null);
//       })
//       .catch((err) => console.log("API Error:", err));
//   }, [id]);

//   if (!item) return <Text style={{ padding: 20 }}>Loading...</Text>;

//   const imageUrl = `https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item/photo/${item.id}`;

//   return (
//     <ScrollView style={styles.container}>
//       {/* IMAGE SECTION */}
//       <View style={styles.imageContainer}>
//         <Image
//           source={{ uri: imageUrl }}
//           style={styles.image}
//           resizeMode="cover"
//         />

//         {/* Rating + Expiry */}
//         <View style={styles.overlay}>
//           <View style={styles.ratingBox}>
//             <Text style={styles.ratingText}>4.2★</Text>
//             <Text style={styles.reviews}> 3.7K+</Text>
//           </View>

//           <View style={styles.expiryBox}>
//             <Text style={styles.expiryText}>Expiry 02 Dec 2025</Text>
//           </View>
//         </View>
//       </View>

//       {/* CONTENT SECTION */}
//       <View style={styles.content}>
//         <Text style={styles.title}>PDF Course - {item.name}</Text>

//         <View style={styles.offerTag}>
//           <Text style={styles.offerText}>Lowest Price in 30 days</Text>
//         </View>

//         <View style={styles.priceRow}>
//           <Text style={styles.discount}>50% OFF</Text>
//           <Text style={styles.oldPrice}>₹{item.price * 2}</Text>
//           <Text style={styles.newPrice}>₹{item.price}</Text>
//         </View>

//         <Text style={styles.quantityText}>Selected Quantity: 70-80g</Text>

//         <View style={styles.wowDeal}>
//           <Text style={styles.wowText}>WOW! DEAL Buy at ₹8</Text>
//           <Text style={styles.saveText}>Apply offers for maximum savings!</Text>
//         </View>

//         <TouchableOpacity style={styles.cartButton}>
//           <Text style={styles.buttonText}>Add to Cart</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// export default PdfCourse;

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, TouchableOpacity, View } from "react-native";
import ImageCarousel from "./components/ImageCarousel";
import ScrollingText from "./components/ScrollingText";
import FarmingGoalsSection from "./stickyJoinBar/farmingGoals";
import StickyJoinBar from "./stickyJoinBar/stickyJoinBar";
import StrugglesSection from "./stickyJoinBar/strugglesSection";
import FeaturesSection from "./vegetableCoursesSection/featuresSection";
import IntroductionPdf from "./vegetableCoursesSection/introductionPdf";
import styles from "./vegetableCoursesSection/pdfCourseStyles";

export default function PdfCourse() {
  const navigation = useNavigation();
  const images = [
    require("../assets/images/img-3.jpg"),
    require("../assets/images/img-2.jpg"),
    require("../assets/images/img-3.jpg"),
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Using FlatList instead of ScrollView */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 40,
          left: 4,
          zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <FlatList
        data={[1]} // dummy data
        keyExtractor={(item, index) => index.toString()}
        renderItem={() => (
          <View style={styles.container}>
            <ScrollingText text="🌱 Start Learning Farming | Learn Modern & Organic Farming Today 🌾" />

            <ImageCarousel
              images={images}
              duration={3000}
              style={styles.carouselImage}
            />

            <IntroductionPdf />

            <FarmingGoalsSection />

            <StrugglesSection />

            <FeaturesSection />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Footer */}
      <StickyJoinBar
        price={2499}
        onJoinPress={() => console.log("Join clicked")}
      />
    </View>
  );
}
