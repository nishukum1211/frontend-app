import { StyleSheet, Text, View } from "react-native";

interface IntroductionPdfProps {
  desc_hn: string;
}

const IntroductionPdf = ({ desc_hn }: IntroductionPdfProps) => {
  // CLEAN TEXT SPACING
  const cleanedText = desc_hn
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/[^\S\r\n]+/g, " ")
    .trim();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📗 शीर्ष उत्तम खेती PDF कोर्स</Text>
          <Text style={styles.badgeSub}>
            बीजाई से जुड़ाई तक पूरी मार्गदर्शिका
          </Text>
        </View>

        <Text style={styles.bodyText}>
          ● किसान भाइयों मैं Duleshwar, Chhattisgarh से हूँ।{"\n"}
          पिछले कई सालों से खीरा 🥒, टमाटर 🍅, बैंगन 🍆, मिर्च 🌶️ और करेला 🍃 की
          उत्तम खेती कर रहा हूँ। मैं कुल 16 एकड़ में खेती करता हूँ।
          {cleanedText ? `\n\n● ${cleanedText}` : ""}
          {"\n\n"}● अपने लंबे अनुभव, कई किसानों के खेत पर जाकर, उनकी समस्याओं को
          समझकर वास्तविक समाधान एवं किसानों की जरूरतों को ध्यान में रखते हुए,
          मैंने यह PDF तैयार किया है।
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    backgroundColor: "#E9F7EC",
    flex: 1,
  },

  card: {
    padding: 20,
  },

  badge: {
    backgroundColor: "#f4c99d",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },

  badgeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a2e19",
  },

  badgeSub: {
    fontSize: 13,
    color: "#4a2e19",
    marginTop: 2,
  },

  bodyText: {
    fontSize: 15,
    lineHeight: 26,
    color: "#4a3b2d",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default IntroductionPdf;
