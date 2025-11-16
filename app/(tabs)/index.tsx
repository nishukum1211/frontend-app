import { auth } from "@/app/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import AgentWidget from "../agentWidget"; // adjust path if needed
//import AnimatedSplash from "../animatedSplash";
import ImageCarousel from "../components/ImageCarousel";
import IntroMessage from "../introMessage";

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
  useEffect(() => {
    navigation.setOptions({
      title: "Home",
      headerRight: () =>
        !user ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("login" as never)}
            style={{ marginRight: 15 }}
          >
            <MaterialCommunityIcons
              name="account-arrow-right"
              size={28}
              color="#007AFF"
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, user]);

  return (
    <FlatList
      data={[1]} // dummy data
      keyExtractor={() => "home"}
      renderItem={() => (
        <View>
          <View
            style={{
              marginBottom: 10,
              backgroundColor: "#EAF4FF",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{
                width: 700,
                height: 200,
                resizeMode: "contain",
              }}
            />
          </View>

          <View style={{ alignItems: "center", marginBottom: 10 }}>
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
          </View>

          <AgentWidget />
        </View>
      )}
    />
  );
}
