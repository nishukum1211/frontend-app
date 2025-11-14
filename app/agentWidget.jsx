import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

export default function AgentWidget() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetch("https://dev-backend-py-23809827867.us-east1.run.app/agent/list")
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((err) => console.log("API ERROR:", err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Agents
      </Text>

      <FlatList
        data={agents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/agentDetails",
                params: {
                  id: item.id,
                  name: item.name,
                  email_id: item.email_id,
                  mobile_number: item.mobile_number,
                  bio: item.bio,
                },
              })
            }
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              marginBottom: 15,
            }}
          >
            <Image
              source={{ uri: "https://i.pravatar.cc/150" }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                marginRight: 15,
              }}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.name}
              </Text>
              <Text style={{ color: "gray", marginTop: 4 }}>
                {item.email_id}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={30}
              color="gray"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
