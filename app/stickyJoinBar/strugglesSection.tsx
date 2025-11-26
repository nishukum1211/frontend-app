import { FlatList, Text, View } from "react-native";
import styles from "./strugglesSectionStyles";

const struggles = [
  {
    id: "1",
    text: "बेहद आसान भाषा एवं पूरा तकनिकी ज्ञान पर आधारित PDF",
  },
  {
    id: "2",
    text: "किसानो की असली समस्यायों पर आधारित समाधान",
  },
  {
    id: "3",
    text: "रोगों से फसल को बचने के प्रैक्टिकल ट्रिक्स एंड टिप्स",
  },
  {
    id: "4",
    text: "वैज्ञानिक + फील्ड अनुभव पर आधारित सटीक जानकारी",
  },
];

export default function StrugglesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>यह कोर्स क्यों ख़ास है?</Text>
      {/* <Text style={styles.highlight}>Find in the PDF?</Text> */}

      <FlatList
        data={struggles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Number Circle */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{index + 1}</Text>
            </View>

            {/* Text */}
            <Text style={styles.cardText}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}
