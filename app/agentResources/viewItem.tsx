import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SellableItem } from "../api/agent";
import { SubscriptionService } from "../api/subscription";
import { User, UserService } from "../api/user";

const UserCard = ({ user }: { user: User }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${user.mobile_number.replace(/\s/g, "")}`);
  };

  return (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMobile}>{user.mobile_number}</Text>
      </View>
      <TouchableOpacity
        style={styles.callButton}
        onPress={handleCall}
      >
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </View>
  );
};
export default function ViewItemScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const item: SellableItem = JSON.parse(params.item as string);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  // States for the subscription modal
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const fetchSubscribedUsers = async () => {
    setLoading(true);
    const subscribedUsers =
      await SubscriptionService.getUsersSubscribedToCourse(item.id);
    if (subscribedUsers) {
      const uniqueUsers = subscribedUsers.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.id === user.id)
      );
      setUsers(uniqueUsers);
    }
    setLoading(false);
  };

  const handleSearchUser = async () => {
    if (!phoneNumber) {
      Alert.alert("Phone number required", "Please enter a phone number to search.");
      return;
    }
    setSearching(true);
    setSearchedUser(null);
    try {
      const user = await UserService.fetchUserByMobileNumber(
        phoneNumber.replace(/\s/g, "")
      );
      if (user) {
        setSearchedUser(user);
      } else {
        Alert.alert("User not found", "No user found with this mobile number.");
      }
    } catch (error) {
      console.error("Search user error:", error);
      Alert.alert("Search Failed", "An error occurred while searching for the user.");
    }
    setSearching(false);
  };

  const handleSubscribe = async () => {
    if (!searchedUser) {
      Alert.alert("Missing Information", "User is required.");
      return;
    }

    setSubscribing(true);
    const subscriptionData = {
      course_id: item.id,
      order_id: `offline_${Date.now()}`,
      price_paid: item.price,
    };
    const success = await SubscriptionService.createOfflineSubscription(
      subscriptionData,
      searchedUser.id
    );
    if (success) {
      Alert.alert("Success", "User subscribed successfully.");
      setModalVisible(false);
      fetchSubscribedUsers(); // Refresh the list
    } else {
      Alert.alert("Failed", "Could not subscribe the user.");
    }
    setSubscribing(false);
  };

  useEffect(() => {
    navigation.setOptions({
      title: item.name,
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      ),
    });

    fetchSubscribedUsers();
  }, [navigation, item.id]);

  const resetModalState = () => {
    setPhoneNumber("");
    setSearchedUser(null);
    setSearching(false);
    setSubscribing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.subscribedUsersTitle}>Subscribed Users</Text>
        {!loading && users && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{users.length}</Text>
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserCard user={item} />}
          keyExtractor={(user) => user.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No users have subscribed to this item yet.
            </Text>
          }
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
        onShow={resetModalState}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Add Subscriber</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearchUser} disabled={searching}>
                    <Text style={styles.searchButtonText}>{searching ? "..." : "Search"}</Text>
                  </TouchableOpacity>
                </View>

                {searching && <ActivityIndicator style={{ marginVertical: 20 }} />}

                {searchedUser && (
                  <View style={styles.searchedUserContainer}>
                    <Text style={styles.searchedUserName}>{searchedUser.name}</Text>
                    <Text style={styles.searchedUserMobile}>{searchedUser.mobile_number}</Text> 

                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        subscribing && styles.disabledButton,
                      ]}
                      onPress={handleSubscribe}
                      disabled={subscribing}
                    >
                      <Text style={styles.subscribeButtonText}>
                        {subscribing ? "Subscribing..." : "Subscribe"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#E5E7EB",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#059669",
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subscribedUsersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  countBadge: {
    backgroundColor: "#053214ff",
    borderRadius: 55,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  userMobile: {
    fontSize: width > 360 ? 20 : 18,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 4,
  },
  userDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B7280",
  },
  userInfo: {
    flex: 1,
  },
  callButton: {
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  callButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  addButton: {
    marginRight: 15,
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
    padding: 25,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    fontSize: 16,
    height: 60,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  searchedUserContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 10,
  },
  searchedUserName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchedUserMobile: {
    fontSize: 16,
    color: "gray",
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    width: "100%",
  },
  subscribeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  readOnlyInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
    fontSize: 24, // Increased font size for more prominence
    height: 80, // Increased height for a larger text box
    width: '100%', // Make it take full width
  },
});
