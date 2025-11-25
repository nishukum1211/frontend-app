import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import styles from "../call/callStyles";

export default function CallCard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.innerWrapper}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => router.push("../call/callRequest")}
        >
          {/* SMALLER IMAGE */}
          <Image
            source={require("../../assets/images/call-salah.jpg")}
            style={styles.smallImage}
          />

          {/* TOP LEFT CONTENT OVER IMAGE */}
          <View style={styles.overlayContainer}>
            <View style={styles.row}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="phone-in-talk" size={28} color="#16A34A" />
              </View>

              <View style={styles.textColumn}>
                <Text style={styles.callMainText}>Call</Text>
                <Text style={styles.callSubText}>मैं सलाह लें</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}