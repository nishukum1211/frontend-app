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
        paddingTop: 100,
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
                pathname: "./pdfView",
                params: { id: item.id },
              })
            }
            style={{
              padding: 15,
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
              {item.name} -
            </Text>
            <Text>{item.desc}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              {/* PRICE TAG */}
              <View
                style={{
                  backgroundColor: "#4C6EF5",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  width: "28%", // adjust as you want
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  ₹{item.price}
                </Text>
              </View>

              {/* BUY BUTTON */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#2F9E44",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  width: "18%", // same width for symmetry
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Buy
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
