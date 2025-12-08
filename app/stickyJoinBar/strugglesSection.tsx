import { FlatList, Text, View } from "react-native";
import styles from "./strugglesSectionStyles";

const struggles = [
  {
    id: "1",
    text: "सरल भाषा + संपूर्ण तकनीकी ज्ञान",
  },
  {
    id: "2",
    text: "किसानों की वास्तविक समस्याओं पर आधारित समाधान",
  },
  {
    id: "3",
    text: "फसल को रोगों से बचाने के व्यावहारिक तरीके",
  },
  {
    id: "4",
    text: "वैज्ञानिक और फील्ड अनुभव पर आधारित सटीक जानकारी",
  },
  {
    id: "5",
    text: "मोबाइल पर कहीं भी , कभी भी उपलब्ध",
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
