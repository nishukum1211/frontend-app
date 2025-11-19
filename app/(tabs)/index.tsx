import { auth } from "@/app/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import Call from "../call/call";
import VegetableCoursesSection from "../vegetableCoursesSection/vegetableCoursesSection";
import VegetableSubscription from "../vegetableSubscription/vegetableSubscription";
//import AnimatedSplash from "../animatedSplash";

export default function Home() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Run auth check every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return unsubscribe;
    }, [])
  );

  // Dynamically update header
  // Dynamically update header
  useEffect(() => {
    navigation.setOptions({
      title: "",

      // LEFT SIDE: profile icon if logged in, login icon if logged out
      headerRight: () =>
        user ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("phoneLoginScreen" as never)}
            style={{ marginLeft: 15 }}
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
        <View>
          <View>
            <Call />
            <VegetableSubscription />
          </View>
          <View>
            <VegetableCoursesSection />
          </View>
          {/* <View style={{ alignItems: "center", marginBottom: 10 }}>
            <IntroMessage />
          </View>

          <View
            style={{
              flex: 1,
              width: "100%",
              height: 250,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <ImageCarousel
              images={[
                require("../../assets/images/img-4.jpg"),
                require("../../assets/images/img-1.jpg"),
                require("../../assets/images/img-2.jpg"),
                require("../../assets/images/img-3.jpg"),
                require("../../assets/images/img-5.jpg"),
              ]}
              duration={2000}
            />
          </View> */}

          {/* <AgentWidget /> */}
        </View>
      )}
    />
  );
}
