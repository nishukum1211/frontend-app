import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

// Enable animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AgentWidget() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("https://dev-backend-py-23809827867.us-east1.run.app/agent/list")
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((err) => console.log("API ERROR:", err));
  }, []);

  const toggleExpand = (id) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Experts
      </Text>

      <FlatList
        data={agents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOpen = expandedId === item.id;

          return (
            <View
              style={{
                backgroundColor: "#fff",
                padding: 5,
                borderRadius: 12,
                marginBottom: 15,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 3,
              }}
            >
              {/* AGENT TOP ROW */}
              <View style={{ flexDirection: "column" }}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150" }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                  }}
                />

                <View style={{ flex: 1, marginTop: 10, paddingLeft: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: "normal" }}>
                    {item.bio}
                  </Text>
                </View>

                {/* More Info Button */}
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#4C6EF5",
                      fontWeight: "600",
                    }}
                    onPress={() =>
                      router.replace({
                        pathname: "/agentDetails",
                        params: {
                          id: item.id,
                          name: item.name,
                          email_id: item.email_id,
                          mobile_number: item.mobile_number,
                          bio: item.bio,
                          role: item.role,
                        },
                      })
                    }
                  >
                    More Info
                  </Text>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#4C6EF5"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
