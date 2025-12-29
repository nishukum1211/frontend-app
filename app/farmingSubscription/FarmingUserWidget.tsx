import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../api/user";
import { useRouter } from "expo-router";

interface FarmingUserWidgetProps {
    user: User;
}

const FarmingUserWidget: React.FC<FarmingUserWidgetProps> = ({ user }) => {
    const router = useRouter();

    const getSubscriptionStatus = (expiryDate: string | null): { text: string; color: string } => {
        if (!expiryDate) {
            return { text: "No Subscription", color: "gray" };
        }

        const today = new Date();
        const expiry = new Date(expiryDate);
        expiry.setHours(23, 59, 59, 999); // Set to end of the day for accurate comparison

        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { text: "Expired", color: "red" };
        } else if (diffDays <= 10) {
            return { text: `Expiring in ${diffDays} day${diffDays === 1 ? "" : "s"}`, color: "orange" };
        } else {
            return { text: "Active", color: "green" };
        }
    };

    const status = getSubscriptionStatus(user.farming_subs_expiry);

    const handleChatPress = () => {
        router.push({
            pathname: "/chat/agentChatDetail",
            params: { id: user.id, userName: user.name },
        });
    };

    const handleCallPress = () => {
        if (user.mobile_number) {
            Linking.openURL(`tel:${user.mobile_number}`);
        }
    };

    return (
        <View style={styles.card}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.mobile}>{user.mobile_number}</Text>
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[styles.statusText, { color: status.color }]}>
                    {status.text}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCallPress}>
                    <Ionicons name="call" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.chatButton]} onPress={handleChatPress}>
                    <Text style={styles.actionButtonText}>Chat</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    mobile: {
        fontSize: 16,
        color: "#555",
        marginBottom: 10,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statusLabel: {
        fontSize: 14,
        marginRight: 5,
        fontWeight: "600",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    actionButton: {
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        flex: 1, // Distribute space equally
        marginHorizontal: 5, // Add some spacing between buttons
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonContainer: {
        flexDirection: "row", // Arrange buttons horizontally
        marginTop: 10,
        justifyContent: "space-between", // Space out buttons evenly
    },
    callButton: {
        backgroundColor: "red", // Make call button red
    },
    chatButton: {
        backgroundColor: "#08b42dff", // Make chat button green
    },
});

export default FarmingUserWidget;
