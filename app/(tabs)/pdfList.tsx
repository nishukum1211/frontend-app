import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getUserData } from "../auth/action";
import { DecodedToken, removeUserData } from "../auth/auth";
import { CourseService, Subscription } from "../course/courseCache";

const SubscriptionItem = ({ item, onPress }: { item: Subscription, onPress: () => void }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    CourseService.getThumbnailFromStorage(item.id).then(setThumbnail);
  }, [item.id]);

  const today = new Date();
  const expiryDate = new Date(item.expiry_date);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let statusText;
  let statusStyle;

  if (diffDays > 30) {
    statusText = "Active";
    statusStyle = styles.activeStatus;
  } else if (diffDays > 0 && diffDays <= 30) {
    statusText = `${diffDays} days left`;
    statusStyle = styles.expiringSoonStatus;
  } else {
    statusText = "Expired";
    statusStyle = styles.expiredStatus;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <Image
        source={thumbnail ? { uri: thumbnail } : require("../../assets/images/logo.png")}
        style={styles.thumbnail}
      />
      <Text style={styles.itemName}>{item.name}</Text>

      {/* <View style={styles.heartIcon}>
        <Ionicons name="heart-outline" size={22} color="black" />
      </View> */}

      <View style={[styles.statusBadge, statusStyle]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function PdfList() {
  const router = useRouter();
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isForcedRefresh = false) => {
    // Don't show the main loader on a pull-to-refresh
    if (!isForcedRefresh) {
      setLoading(true);
    }

    const userData = await getUserData();    

    if (userData) {
      // Check if the token is expired
      if (userData.exp && userData.exp * 1000 < Date.now()) {
        await removeUserData(); // Clear expired user data
        setUser(null);
        setSubscriptions([]);
      } else {
        setUser(userData);
        // Fetch subscriptions only for valid 'user' role
        if (userData.role === 'user') {
          const subs = await CourseService.getStoredSubscriptions(isForcedRefresh);
          if (subs) {
            setSubscriptions(subs);
          }
        }
      }
    } else {
      setUser(null);
      setSubscriptions([]);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    loadData(false);
  }, [loadData]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // As requested, call syncCourseAssets with forceRefresh = true
    CourseService.syncCourseAssets(true).then(() => {
      loadData(true); // Then reload the list data from the API
    });
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading your resources...</Text>
      </View>
    );
  }

  if (!user || subscriptions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: 'gray' }}>No subscriptions found.</Text>
        <Text style={{ marginTop: 8, color: 'gray' }}>Subscribe to courses to see them here.</Text>
      </View>
    )
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionItem
            item={item}
            onPress={() =>
              router.push({
                pathname: "/course/PdfView",
                params: { pdfId: item.id, courseName: item.name },
              })
            }
          />
        )}
        contentContainerStyle={{ paddingVertical: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]} // Spinner color
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16, // Add horizontal margin
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden', // Ensures content respects the border radius
  },
  thumbnail: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#1F2937',
  },
  heartIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 20,
    elevation: 4,
  },
  expiryButton: {
    backgroundColor: "#FEF2F2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  expiryText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF', // Default text color for badges
  },
  activeStatus: {
    backgroundColor: '#28A745', // Green for active
  },
  expiringSoonStatus: {
    backgroundColor: '#DC3545', // Red for expiring soon
  },
  expiredStatus: {
    backgroundColor: '#DC3545', // Red for expired
  },
});
