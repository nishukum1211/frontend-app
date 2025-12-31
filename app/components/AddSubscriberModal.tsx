import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { User, UserService } from "../api/user";

interface AddSubscriberModalProps {
    visible: boolean;
    onClose: () => void;
    courseId: string;
    price: number;
    onSuccess: () => void;
    createSubscriptionMethod: (subscriptionData: any, userId: string) => Promise<boolean>;
}

export default function AddSubscriberModal({
    visible,
    onClose,
    courseId,
    price,
    onSuccess,
    createSubscriptionMethod,
}: AddSubscriberModalProps) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [searchedUser, setSearchedUser] = useState<User | null>(null);
    const [searching, setSearching] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const resetModalState = () => {
        setPhoneNumber("");
        setSearchedUser(null);
        setSearching(false);
        setSubscribing(false);
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
            course_id: courseId,
            order_id: `offline_${Date.now()}`,
            price_paid: price,
        };
        const success = await createSubscriptionMethod(
            subscriptionData,
            searchedUser.id
        );
        if (success) {
            Alert.alert("Success", "User subscribed successfully.");
            onSuccess();
            onClose();
        } else {
            Alert.alert("Failed", "Could not subscribe the user.");
        }
        setSubscribing(false);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            onShow={resetModalState}
        >
            <TouchableWithoutFeedback onPress={onClose}>
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
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={handleSearchUser}
                                    disabled={searching}
                                >
                                    <Text style={styles.searchButtonText}>
                                        {searching ? "..." : "Search"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {searching && <ActivityIndicator style={{ marginVertical: 20 }} />}

                            {searchedUser && (
                                <View style={styles.searchedUserContainer}>
                                    <Text style={styles.searchedUserName}>{searchedUser.name}</Text>
                                    <Text style={styles.searchedUserMobile}>
                                        {searchedUser.mobile_number}
                                    </Text>

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

                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
});
