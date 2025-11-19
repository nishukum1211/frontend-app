import { MaterialIcons } from "@expo/vector-icons";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import styles from "./callStyles";

export default function CallScreen() {
  const onCallPress = () => {
    const phone = "+917764029102";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerWrapper}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={onCallPress}
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
