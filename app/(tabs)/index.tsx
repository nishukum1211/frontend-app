// Home.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View } from "react-native";
import { getUserData } from "../auth/action";
import { DecodedToken } from "../auth/auth";
import CallCard from "../call/CallCard";
import AgentCallRequestsScreen from "../home/AgentCallDashboard";
import VegetableCoursesSection from "../vegetableCoursesSection/vegetableCoursesSection";
import VegetableSubscription from "../vegetableSubscription/vegetableSubscription";

/**
 * Home screen:
 * - Header left: logo
 * - Header right: profile button (navigates to hidden profile route)
 * - Camera removed from header (camera available via center tab)
 */

export default function Home() {
  const navigation = useNavigation();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth check each focus
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const fetchUser = async () => {
        const userData = await getUserData();
        if (mounted) {
          setUser(userData);
          setIsLoading(false);
        }
      };

      fetchUser();

      return () => {
        mounted = false;
      };
    }, [])
  );

  // Set header: left logo, right profile button only
  useEffect(() => {
    navigation.setOptions({
      title: "",
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
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("profile" as never)}
          style={{ marginRight: 12 }}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={30}
            color="#007AFF"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={[1]}
      keyExtractor={() => "home"}
      renderItem={() =>
        user?.role !== "agent" ? (
          <View>
            <CallCard />
            <VegetableSubscription />
            <VegetableCoursesSection />
          </View>
        ) : (
          <AgentCallRequestsScreen />
        )
      }
    />
  );
}
