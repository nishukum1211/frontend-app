import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageCarousel from "./components/ImageCarousel";
import PaymentSuccessModal from "./components/PaymentSuccessModal";
import ScrollingText from "./components/ScrollingText";
import RazorpayCheckout from "./pay/RazorpayCheckout";
import { createRazorpayOrder } from "./pay/razorpay_api";
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentVisible, setPaymentVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const price = 199;

  const handleJoinPress = async () => {
    setIsLoading(true);
    try {
      const newOrderId = await createRazorpayOrder(price);
      if (newOrderId) {
        setOrderId(newOrderId);
        setPaymentVisible(true);
      } else {
        Alert.alert("Error", "Could not create a payment order.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while trying to create a payment order.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string, signature: string) => {
    setPaymentVisible(false);
    setSuccessModalVisible(true);
    // TODO: Verify payment signature on your backend and grant access to the course
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    navigation.goBack(); // Go back to the previous screen after success
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        transparent={true}
        animationType="none"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
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
        price={price}
        onJoinPress={handleJoinPress}
      />

      {orderId && (
        <RazorpayCheckout
          visible={isPaymentVisible}
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaymentVisible(false)}
        />
      )}

      <PaymentSuccessModal
        visible={isSuccessModalVisible}
        onClose={handleCloseSuccessModal}
        price={price}
      />
    </SafeAreaView>
  );
}
