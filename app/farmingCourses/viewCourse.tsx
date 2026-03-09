import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAndCacheBlobFile } from "../api/common";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import ParagraphDisplay from "../vegetableCoursesSection/model/ParagraphDisplay";

interface ContentItem {
  id: string;
  content_type: string;
  data: string | string[];
}

function FarmingImageDisplay({ imageName }: { imageName: string }) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (imageName.startsWith("file://") || imageName.startsWith("http")) {
        if (isMounted) { setImageUri(imageName); setLoading(false); }
        return;
      }

      const uri = await fetchAndCacheBlobFile(imageName);
      if (isMounted) { setImageUri(uri); setLoading(false); }
    };

    fetchImage();
    return () => { isMounted = false; };
  }, [imageName]);

  if (loading) {
    return (
      <View style={[imgStyles.container, imgStyles.center]}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }
  if (!imageUri) return null;

  return (
    <View style={imgStyles.container}>
      <Image source={{ uri: imageUri }} style={imgStyles.image} resizeMode="cover" />
    </View>
  );
}

const imgStyles = StyleSheet.create({
  container: { marginVertical: 10, borderRadius: 12, overflow: "hidden", backgroundColor: "#f0f0f0", minHeight: 200 },
  center: { justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 220 },
});

function Bullet1Section({ points }: { points: string[] }) {
  return (
    <View style={styles.bulletContainer}>
      {points.map((item, index) => (
        <View key={index} style={styles.bullet1Card}>
          <View style={styles.bullet1Dot}>
            <Text style={styles.bullet1DotText}>✓</Text>
          </View>
          <Text style={styles.bullet1Text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Bullet2Section({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletContainer}>
      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.bullet2Row}
        renderItem={({ item, index }) => (
          <View style={styles.bullet2Card}>
            <View style={styles.bullet2Circle}>
              <Text style={styles.bullet2CircleText}>{index + 1}</Text>
            </View>
            <Text style={styles.bullet2Text}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

export default function ViewFarmingCourse() {
  const params = useLocalSearchParams();

  const crops = params.crops || "Farming";
  const price = params.price ? String(params.price) : "0";
  const durationDays = params.duration_days ? String(params.duration_days) : "30";
  const content: ContentItem[] = params.content
    ? JSON.parse(params.content as string)
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderWithBackButton title={`${crops}`} />

      <FlatList
        style={{ flex: 1 }}
        data={[1]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={() => (
          <View style={styles.container}>
            {/* Heading */}
            <Text style={styles.heading}>Vegetable Farming</Text>

            {/* Subscription badge */}
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionText}>Subscription</Text>
            </View>

            {/* Hindi subtitle */}
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleEmoji}>🌾</Text>
              <Text style={styles.subtitle}>
                इसमें आपको क्या-क्या मिलेगा?
              </Text>
              <Text style={styles.subtitleEmoji}>🌾</Text>
            </View>

            {/* Render content items */}
            {content.map((item) => {
              switch (item.content_type) {
                case "paragraph":
                  return <ParagraphDisplay key={item.id} text={item.data as string} />;
                case "bullet1":
                  return <Bullet1Section key={item.id} points={item.data as string[]} />;
                case "bullet2":
                  return <Bullet2Section key={item.id} items={item.data as string[]} />;
                case "image":
                  return (
                    <FarmingImageDisplay
                      key={item.id}
                      imageName={item.data as string}
                    />
                  );
                default:
                  return null;
              }
            })}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Price & Buy Now */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceText}>₹{price}/- Only</Text>
          <Text style={styles.validityText}>{durationDays} days validity</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} disabled={true}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#B71C1C",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  priceSection: {
    flexDirection: "column",
  },
  priceText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  validityText: {
    fontSize: 13,
    color: "#FFCDD2",
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: "#E57373",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1B5E20",
    textAlign: "center",
    marginTop: 20,
  },
  subscriptionBadge: {
    alignSelf: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  subscriptionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E1",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFD54F",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#E65100",
    textAlign: "center",
    marginHorizontal: 8,
  },
  subtitleEmoji: {
    fontSize: 24,
  },
  bulletContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // Bullet1 styles
  bullet1Card: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  bullet1Dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  bullet1DotText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  bullet1Text: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
    flexShrink: 1,
  },
  // Bullet2 styles
  bullet2Row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bullet2Card: {
    width: "48%",
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  bullet2Circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B5E20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  bullet2CircleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bullet2Text: {
    color: "#333",
    fontSize: 13,
    textAlign: "center",
  },
});
