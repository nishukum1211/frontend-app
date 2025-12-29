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
import {
    FarmingSubscriptionItem,
    FarmingSubscriptionService,
} from "../api/farmingsubs";
import { AppEvents } from "../utils/eventEmitter";

const SubscriptionCard = ({
    item,
    onPress,
    goLive,
    goDown,
}: {
    item: FarmingSubscriptionItem;
    onPress: () => void;
    goLive: (id: string) => void;
    goDown: (id: string) => void;
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
                <TouchableOpacity onPress={handleToggle}>
                    <View
                        style={[
                            styles.statusButton,
                            item.live ? styles.statusLive : styles.statusOffline,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                item.live ? styles.textLive : styles.textOffline,
                            ]}
                        >
                            {item.live ? "Live" : "Offline"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function SubscriptionList() {
    const [subscriptions, setSubscriptions] = useState<FarmingSubscriptionItem[]>(
        []
    );
    const [loading, setLoading] = useState(true);
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
        alignItems: "flex-start",
    },
    itemPrice: {
        fontSize: 22,
        color: "#059669",
        fontWeight: "bold",
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