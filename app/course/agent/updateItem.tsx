import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AgentService, SellableItem } from "../../api/agent";


export default function UpdateItemScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const item: SellableItem = JSON.parse(params.item as string);

    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price.toString());
    const [desc, setDesc] = useState(item.desc ?? "");
    const [descHn, setDescHn] = useState(item.desc_hn ?? "");

    const handleUpdate = useCallback(async () => {
        const updatedFields: Partial<SellableItem> = {};

        if (name !== item.name) {
            updatedFields.name = name;
        }
        if (price !== item.price.toString()) {
            updatedFields.price = parseFloat(price);
        }
        if (desc !== (item.desc ?? "")) {
            updatedFields.desc = desc;
        }
        if (descHn !== (item.desc_hn ?? "")) {
            updatedFields.desc_hn = descHn;
        }

        if (Object.keys(updatedFields).length === 0) {
            Alert.alert("No Changes", "No modifications were made.");
            return;
        }

        try {
            const success = await AgentService.updateSellableItem(
                item.id,
                updatedFields.name ?? null,
                updatedFields.price ?? null,
                updatedFields.desc ?? null,
                updatedFields.desc_hn ?? null
            );
            if (success) {
                Alert.alert("Item Updated", "The item has been updated successfully.", [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace("/agent/agentResources");
                        },
                    },
                ]);
            } else {
                Alert.alert("Update Failed", "Could not update the item. Please try again.");
            }
        } catch (error) {
            Alert.alert("An Error Occurred", "An unexpected error occurred during the update.");
        }
    }, [item, name, price, desc, descHn, router]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.row}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Item Name"
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            placeholder="Item Price"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Description (Current)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={desc}
                    onChangeText={setDesc}
                    placeholder="Item Description (Current)"
                    multiline
                />

                <Text style={styles.label}>Description (Hindi)</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={descHn}
                    onChangeText={setDescHn}
                    placeholder="Item Description (Hindi)"
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                    <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F9FAFB",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
    },
    inputContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#1F2937",
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: "#4B5563",
    },
    input: {
        backgroundColor: "white",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
        borderColor: "#D1D5DB",
        borderWidth: 1,
    },
    textArea: {
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
