import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function AgentDetails() {
  const { name, email_id, mobile_number, bio } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* Header Section */}
      <LinearGradient
        colors={["#4C6EF5", "#3B5BDB"]}
        style={{
          paddingVertical: 60,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        <Image
          source={{ uri: "https://i.pravatar.cc/300" }}
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            borderWidth: 3,
            borderColor: "white",
            alignSelf: "center",
          }}
        />

        <Text
          style={{
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
            color: "white",
            marginTop: 15,
          }}
        >
          {name}
        </Text>

        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            color: "#E9ECEF",
            marginTop: 5,
            paddingHorizontal: 20,
          }}
        >
          {bio}
        </Text>
      </LinearGradient>

      {/* Card Section */}
      <View
        style={{
          marginTop: -40,
          marginHorizontal: 20,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 16, color: "#666" }}>📧 Email</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111" }}>
            {email_id}
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 16, color: "#666" }}>📞 Mobile</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111" }}>
            {mobile_number}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
        {/* All PDFs */}
        <TouchableOpacity
          style={{
            backgroundColor: "#4C6EF5",
            padding: 18,
            borderRadius: 15,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4C6EF5",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialCommunityIcons
            name="file-document"
            size={26}
            color="white"
          />
          <Text
            style={{
              color: "white",
              fontSize: 18,
              marginLeft: 12,
              fontWeight: "bold",
            }}
          >
            View All PDFs
          </Text>
        </TouchableOpacity>

        {/* Free Call */}
        <TouchableOpacity
          style={{
            backgroundColor: "#2F9E44",
            padding: 18,
            borderRadius: 15,
            marginBottom: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#2F9E44",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialCommunityIcons name="phone" size={26} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 18,
              marginLeft: 12,
              fontWeight: "bold",
            }}
          >
            Free Call
          </Text>
        </TouchableOpacity>

        {/* Paid Call */}
        <TouchableOpacity
          style={{
            backgroundColor: "#FD7E14",
            padding: 18,
            borderRadius: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#FD7E14",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <MaterialCommunityIcons name="cash" size={26} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 18,
              marginLeft: 12,
              fontWeight: "bold",
            }}
          >
            Paid Call
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
