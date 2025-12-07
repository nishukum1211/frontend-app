import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { getUserData } from "../auth/action";
import { DecodedToken } from "../auth/auth";
import CallCard from "../call/CallCard";
import AgentCallRequestsScreen from "../home/AgentCallDashboard";
import VegetableCoursesSection from "../vegetableCoursesSection/vegetableCoursesSection";
import VegetableSubscription from "../vegetableSubscription/vegetableSubscription";
//import AnimatedSplash from "../animatedSplash";

export default function Home() {
  const navigation = useNavigation();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      console.log("Captured Image:", result.assets[0].uri);
      // You can upload or use the image here
    }
  };

  // Run auth check every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const userData = await getUserData();
        setUser(userData);
      };
      loadUser();
    }, [])
  );

  // Dynamically update header
  // Dynamically update header
  useEffect(() => {
    navigation.setOptions({
      title: "",

      // LEFT SIDE: profile icon if logged in, login icon if logged out
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* CAMERA ICON */}
          <TouchableOpacity onPress={openCamera} style={{ marginRight: 15 }}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={27}
              color="gray"
            />
          </TouchableOpacity>

          {/* PROFILE ICON */}
          {user ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("phoneLoginScreen" as never)}
              style={{ marginRight: 12 }}
            >
              <MaterialCommunityIcons
                name="account-circle"
                size={30}
                color="#007AFF"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("phoneLoginScreen" as never)}
              style={{ marginRight: 12 }}
            >
              <MaterialCommunityIcons
                name="account-arrow-right"
                size={30}
                color="#007AFF"
              />
            </TouchableOpacity>
          )}
        </View>
      ),

      headerLeft: () => (
        <Image
          source={require("../../assets/images/logo.png")}
          style={{
            width: 140,
            height: 100,
            resizeMode: "contain",
          }}
        />
      ),

      // RIGHT SIDE: logo always visible
    });
  }, [navigation, user]);

  return (
    <FlatList
      data={[1]} // dummy data
      keyExtractor={() => "home"}
      renderItem={() => (
        user?.role !== "agent" ? (
          <View>
            <View>
              <CallCard />
              <VegetableSubscription />
            </View>
            <View>
              <VegetableCoursesSection />
            </View>
          </View>
        ) : <AgentCallRequestsScreen />
      )}
    />
  );
}
