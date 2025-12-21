import { FlatList, Text, View } from "react-native";
import styles from "./strugglesSectionStyles";

/*------------------------ Bullet 2----------------------------*/
const defaultStruggles = [
  "सरल भाषा + संपूर्ण तकनीकी ज्ञान",
  "किसानों की वास्तविक समस्याओं पर आधारित समाधान",
  "फसल को रोगों से बचाने के व्यावहारिक तरीके",
  "वैज्ञानिक और फील्ड अनुभव पर आधारित सटीक जानकारी",
  "मोबाइल पर कहीं भी , कभी भी उपलब्ध",
  "एक क्लिक में मिलेगा सही और सटीक समाधान"
];

interface StrugglesSectionProps {
  items?: string[];
}

export default function StrugglesSection({ items }: StrugglesSectionProps) {
  const data = items || defaultStruggles;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>यह कोर्स क्यों ख़ास है?</Text>
      {/* <Text style={styles.highlight}>Find in the PDF?</Text> */}

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Number Circle */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{index + 1}</Text>
            </View>

            {/* Text */}
            <Text style={styles.cardText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}
