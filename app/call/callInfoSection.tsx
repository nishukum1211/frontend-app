import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CallInfoSection = ({
  onFreePress,
  onPaidPress,
}: {
  onFreePress: () => void;
  onPaidPress: () => void;
}) => {
  return (
    <View style={styles.container}>
      {/* FREE CALL SECTION */}
      <View style={styles.card}>
        <View style={styles.iconArea}>
          <View style={[styles.iconCircle, { backgroundColor: "#4CAF50" }]}>
            <MaterialIcons name="phone" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>Free Call Support</Text>
          <Text style={styles.description}>
            हर किसान को मूलभूत जानकारी और सामान्य सवालों के लिए बिल्कुल मुफ्त
            कॉल सहायता प्रदान की जाती है।
          </Text>

          <TouchableOpacity style={styles.freeButton} onPress={onFreePress}>
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PAID CALL SECTION */}
      <View style={styles.card}>
        <View style={styles.iconArea}>
          <View style={[styles.iconCircle, { backgroundColor: "red" }]}>
            <FontAwesome5 name="headset" size={24} color="#fff" />
          </View>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>Paid Expert Call</Text>
          <Text style={styles.description}>
            गंभीर समस्याओं का समाधान, खेत का विश्लेषण, विशेषज्ञ गाइडेंस और फसल
            सुधार के लिए प्रीमियम पेड कॉल सुविधा उपलब्ध है।
          </Text>

          <TouchableOpacity style={styles.paidButton} onPress={onPaidPress}>
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  card: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#f7f7f7",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },

  /* FIX 1 → Move icon to TOP-LEFT */
  iconArea: {
    marginRight: 12,
    alignItems: "flex-start",
  },

  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  /* FIX 2 → Content should expand full remaining width */
  textArea: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },

  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  freeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: "flex-start",
  },

  paidButton: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: "flex-start",
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CallInfoSection;
