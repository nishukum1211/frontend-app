import { StyleSheet, Text, View } from "react-native";

const IntroductionPdf = () => {
  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={styles.card}>
        {/* Header Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📗 शीर्ष उत्तम खेती PDF कोर्स</Text>
          <Text style={styles.badgeSub}>
            बीजाई से जुड़ाई तक पूरी मार्गदर्शिका
          </Text>
        </View>

        {/* Body Content */}
        <Text style={styles.bodyText}>
          ● किसान भाइयों मैं Duleshwar, Chhattisgarh से हूँ।{"\n"}
          पिछले कई सालों से खीरा 🥒, टमाटर 🍅, बैंगन 🍆, मिर्च 🌶️ और करेला 🍃 की
          उत्तम खेती कर रहा हूँ। मैं कुल 16 एकड़ में खेती करता हूँ।{"\n"}
          {"\n"} ● अगर आप खीरा की खेती को वैज्ञानिक तरीके से सीखकर ज्यादा
          पैदावार और अधिक मुनाफा कमाना चाहते हैं, तो यह एडवांस PDF कोर्स आपके
          लिए एकदम सही है।
          {"\n\n"} ● अपने लंबे अनुभव, कई किसानों के खेत पर जाकर, उनकी समस्याओं
          को समझकर वास्तविक समाधान एवं किसानों की जरूरतों को ध्यान में रखते हुए
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

  point: {
    fontSize: 15,
    lineHeight: 26,
    color: "#4a3b2d",
    marginLeft: 6,
  },
});

export default IntroductionPdf;
