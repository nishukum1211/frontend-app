import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AgentService, SellableItem } from "../api/agent";
import { CourseService } from "../course/courseCache";
import AgentSellItemForm from "./uploadForm";

const ItemCard = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: SellableItem;
  onUpdate: () => void;
  onRemove: () => void;
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    // We can reuse the thumbnail logic from CourseService as it points to the correct endpoint
    CourseService.getThumbnailFromStorage(item.id).then(setThumbnail);
  }, [item.id]);

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onUpdate}>
      <Image
        source={
          thumbnail
            ? { uri: thumbnail }
            : require("../../assets/images/logo.png")
        }
        style={styles.thumbnail}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={onRemove}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AgentResources() {
  const [items, setItems] = useState<SellableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const loadSellableItems = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      setLoading(true);
    }
    const sellableItems = await AgentService.getSellableItems(forceRefresh);
    if (sellableItems) {
      setItems(sellableItems);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSellableItems();
    }, [loadSellableItems])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSellableItems(true);
  }, [loadSellableItems]);

  const handleUploadSuccess = () => {
    setModalVisible(false);
    onRefresh();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.placeholderText}>Loading resources...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholderText}>No items available to sell.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <AgentSellItemForm onUploadSuccess={handleUploadSuccess} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onUpdate={() =>
              router.push({
                pathname: "/agentResources/updateItem", // Ensure this path is correct
                params: {
                  item: JSON.stringify(item),
                },
              })
            }
            onRemove={() => console.log("Remove item:", item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  listContainer: {
    paddingVertical: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
  itemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
  },
  itemDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  itemPrice: {
    fontSize: 18,
    color: "#059669",
    fontWeight: "bold",
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  removeButton: {
    backgroundColor: "#DC2626",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#007AFF",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxHeight: "80%",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
});
