import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

type PdfItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
};

export default function PdfList() {
  const router = useRouter();
  const { agent_id } = useLocalSearchParams();
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);

  useEffect(() => {
    fetch("https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item")
      .then((res) => res.json())
      .then((data: PdfItem[]) => setPdfs(data))
      .catch(console.log);
  }, []);

  return (
    <View
      style={{
        padding: 20,
        paddingTop: 10,
        backgroundColor: "lightgray",
        height: "100%",
      }}
    >
      <FlatList
        data={pdfs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "../pdf/pdfView",
                params: { id: item.id },
              })
            }
            style={{
              padding: 9,
              borderRadius: 12,
              backgroundColor: "#F7F7F7",
              marginBottom: 12,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: `https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item/photo/${item.id}`,
                }}
                style={{
                  width: "100%",
                  height: 190,
                  borderRadius: 12,
                  marginRight: 12,
                  backgroundColor: "#ddd",
                  marginBottom: 10,
                }}
              />

              {/* <Image
                source={require("../../assets/images/subcreiption.png")}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 12,
                  marginBottom: 50,
                }}
              /> */}
            </View>

            <Text
              style={{ fontSize: 18, fontWeight: "bold", paddingBottom: 7 }}
            >
              {item.name}
            </Text>

            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
                backgroundColor: "white",
                padding: 6,
                borderRadius: 20,
                elevation: 3,
              }}
            >
              <Ionicons name="heart-outline" size={22} color="black" />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#FFE5E5",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 14, color: "red", fontWeight: "600" }}>
                12 July 2025
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
