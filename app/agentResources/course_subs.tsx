import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SellableItem } from "../api/agent";
import { SubscriptionService } from "../api/subscription";
import { User } from "../api/user";
import AddSubscriberModal from "../components/AddSubscriberModal";

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
            <AddSubscriberModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                courseId={item.id}
                price={item.price}
                onSuccess={fetchSubscribedUsers}
                createSubscriptionMethod={SubscriptionService.createOfflineSubscription}
            />
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
    readOnlyInput: {
        backgroundColor: '#E5E7EB',
        color: '#6B7280',
        fontSize: 24, // Increased font size for more prominence
        height: 80, // Increased height for a larger text box
        width: '100%', // Make it take full width
    },
});