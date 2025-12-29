import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { FarmingSubscriptionItem, FarmingSubscriptionService } from "../api/farmingsubs";

export default function FarmingSubscription() {
    const [subscriptions, setSubscriptions] = useState<FarmingSubscriptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFarmingCourses();
    }, []);

    const loadFarmingCourses = async () => {
        setLoading(true);
        const data = await FarmingSubscriptionService.listFarmingCourses();
        if (data) {
            setSubscriptions(data);
            // console.log(data);
        }
        setLoading(false);
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
                    <View style={styles.card}>
                        <Text style={styles.title}>Duration: {item.duration_days} Days</Text>
                        <Text style={styles.text}>Price: {item.price}</Text>
                        <Text style={[styles.text, { color: item.live ? "green" : "red" }]}>
                            Status: {item.live ? "Live" : "Down"}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#1F2937",
    },
    text: {
        fontSize: 14,
        color: "#4B5563",
        marginBottom: 2,
    },
});
