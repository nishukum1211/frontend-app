import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { FarmingSubscriptionService } from "../api/farmingsubs";
import { User } from "../api/user";
import FarmingUserWidget from "./FarmingUserWidget";

export default function FarmingSubscription() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUsers = async () => {
        setLoading(true);
        const fetchedUsers = await FarmingSubscriptionService.getFarmingSubscriptionUsers();
        if (fetchedUsers) {
            setUsers(fetchedUsers);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = useCallback(() => {
        fetchUsers();
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push("/farmingSubscription/subscriptionList")}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.headerButtonText}>List</Text>
                        </TouchableOpacity>
                    ),
                    headerTitle: "Farming Subscriptions",
                }}
            />

            {loading && users.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#08b42dff" />
                    <Text style={styles.loadingText}>Loading subscribed users...</Text>
                </View>
            ) : users.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No subscribed users found.</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <FarmingUserWidget user={item} />}
                    contentContainerStyle={styles.listContentContainer}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerButton: {
        backgroundColor: "#08b42dff",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginRight: 20,
    },
    headerButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "white",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "white",
    },
    listContentContainer: {
        paddingVertical: 10,
    },
});
