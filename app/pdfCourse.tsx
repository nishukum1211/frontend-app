import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserData } from "./auth/action";
import HeaderWithBackButton from "./components/HeaderWithBackButton";
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
  const router = useRouter();
  const params = useLocalSearchParams();
  const images = [
    require("../assets/images/img-3.jpg"),
    require("../assets/images/img-2.jpg"),
    require("../assets/images/img-3.jpg"),
  ];
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentVisible, setPaymentVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [userPrefillData, setUserPrefillData] = useState<{ name?: string; email?: string; contact?: string } | undefined>(undefined);
  const price = params.price ? Number(params.price) : 0;
  const crops = params.crops || "Farming";

  const handleJoinPress = async () => {
    const user = await getUserData();
    if (!user) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to join a course.",
        [{ text: "OK", onPress: () => router.push("/phoneLoginScreen") }]
      );
      return;
    }

    // Extract user details for prefill
    setUserPrefillData({
      name: user.name || undefined,
      email: user.email_id || undefined,
      contact: user.mobile_number || undefined,
    });

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
      console.error("Error creating Razorpay order:", error);
      Alert.alert(
        "Error",
        "An error occurred while trying to create a payment order."
      );
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
    router.back(); // Go back to the previous screen after success
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

      <HeaderWithBackButton title={`${crops}`} />

      <FlatList
        style={{ flex: 1 }}
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

      {orderId && userPrefillData && (
        <RazorpayCheckout
          visible={isPaymentVisible}
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaymentVisible(false)}
          prefill={userPrefillData}
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
