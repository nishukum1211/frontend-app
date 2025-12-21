import { StyleSheet, Text, View } from "react-native";


const IntroductionPdf = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📗 शीर्ष उत्तम खेती PDF कोर्स</Text>
          <Text style={styles.badgeSub}>
            बीजाई से जुड़ाई तक पूरी मार्गदर्शिका
          </Text>
        </View>
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
