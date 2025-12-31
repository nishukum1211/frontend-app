import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather icons
import {
    FarmingSubscriptionItem,
    FarmingSubscriptionService,
} from "../api/farmingsubs";
import AddSubscriberModal from "../components/AddSubscriberModal"; // Import AddSubscriberModal
import { AppEvents } from "../utils/eventEmitter";

const SubscriptionCard = ({
    item,
    onPress,
    goLive,
    goDown,
    onAddUser, // New prop for Add User button
}: {
    item: FarmingSubscriptionItem;
    onPress: () => void;
    goLive: (id: string) => void;
    goDown: (id: string) => void;
    onAddUser: (item: FarmingSubscriptionItem) => void; // New prop for Add User button
}) => {
    const handleToggle = () => {
        if (item.live) {
            goDown(item.id);
        } else {
            goLive(item.id);
        }
    };
    return (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.daysContainer}>
                <Text style={styles.daysText}>{item.duration_days}</Text>
                <Text style={styles.daysLabel}>Days</Text>
            </View>
            <View style={styles.itemDetails}>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={handleToggle}>
                        <View
                            style={[
                                styles.statusButton,
                                item.live
                                    ? styles.statusLive
                                    : styles.statusOffline,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    item.live
                                        ? styles.textLive
                                        : styles.textOffline,
                                ]}
                            >
                                {item.live ? "Live" : "Offline"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {/* New "Add User" button */}
                    <TouchableOpacity
                        style={styles.addUserButton}
                        onPress={() => onAddUser(item)}
                    >
                        <Feather name="plus" size={16} color="white" />
                        <Text style={styles.addUserButtonText}>Add User</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function SubscriptionList() {
    const [subscriptions, setSubscriptions] = useState<FarmingSubscriptionItem[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
    const [selectedCourse, setSelectedCourse] =
        useState<FarmingSubscriptionItem | null>(null); // State for selected course
    const router = useRouter();

    useEffect(() => {
        loadFarmingCourses();

        const unsubscribe = AppEvents.on("refresh-subscriptions", () => {
            loadFarmingCourses();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loadFarmingCourses = async () => {
        setLoading(true);
        const data = await FarmingSubscriptionService.listFarmingCourses();
        if (data) {
            setSubscriptions(data);
        }
        setLoading(false);
    };

    const goLive = (id: string) => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to go live?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: async () => {
                        await FarmingSubscriptionService.goLive(id);
                        loadFarmingCourses();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const goDown = (id: string) => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to go offline?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: async () => {
                        await FarmingSubscriptionService.goDown(id);
                        loadFarmingCourses();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handlePress = (item: FarmingSubscriptionItem) => {
        router.navigate({
            pathname: "/farmingSubscription/update",
            params: {
                subscriptionId: item.id,
                duration_days: item.duration_days,
                price: item.price,
            },
        });
    };

    const handleAddUser = (item: FarmingSubscriptionItem) => {
        setSelectedCourse(item);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={subscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        item={item}
                        onPress={() => handlePress(item)}
                        goLive={goLive}
                        goDown={goDown}
                        onAddUser={handleAddUser} // Pass the new handler
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.navigate("/farmingSubscription/update")}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Add Subscriber Modal */}
            {selectedCourse && (
                <AddSubscriberModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    courseId={selectedCourse.id}
                    price={selectedCourse.price}
                    onSuccess={loadFarmingCourses} // Refresh list on success
                    createSubscriptionMethod={
                        FarmingSubscriptionService.createOfflineFarmingSubscription
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        paddingVertical: 16,
    },
    itemContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        flexDirection: "row",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    daysContainer: {
        width: 100,
        height: 100,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
    },
    daysText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F2937",
    },
    daysLabel: {
        fontSize: 14,
        color: "#4B5563",
    },
    itemDetails: {
        flex: 1,
        padding: 12,
        justifyContent: "space-around",
    },
    itemPrice: {
        fontSize: 22,
        color: "#059669",
        fontWeight: "bold",
        marginBottom: 8,
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    statusButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statusLive: {
        backgroundColor: "#DCFCE7",
        borderColor: "#22C55E",
    },
    statusOffline: {
        backgroundColor: "#F3F4F6",
        borderColor: "#9CA3AF",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    textLive: {
        color: "#15803D",
    },
    textOffline: {
        color: "#4B5563",
    },
    addUserButton: {
        flexDirection: "row",
        backgroundColor: "#007AFF",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    addUserButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
        marginLeft: 4,
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
    },
    fabIcon: {
        fontSize: 24,
        color: "white",
    },
});