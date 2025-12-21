import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface PdfUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (file: { uri: string; name: string; mimeType?: string }) => Promise<void>;
}

export default function PdfUploadModal({ visible, onClose, onSave }: PdfUploadModalProps) {
    const [pdf, setPdf] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setPdf({ uri: file.uri, name: file.name, mimeType: file.mimeType });
            }
        } catch (err) {
            console.error("Error picking PDF:", err);
        }
    };

    const handleSave = async () => {
        if (!pdf) return;
        setLoading(true);
        try {
            await onSave(pdf);
            setPdf(null);
            onClose();
        } catch (error) {
            console.error("Error saving PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPdf(null);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Update Course PDF</Text>

                    <TouchableOpacity style={styles.pdfPicker} onPress={pickPdf}>
                        {pdf ? (
                            <View style={styles.pdfPreview}>
                                <MaterialCommunityIcons name="file-pdf-box" size={40} color="#EF4444" />
                                <Text style={styles.pdfName} numberOfLines={1}>{pdf.name}</Text>
                                <Text style={styles.changeText}>Tap to change</Text>
                            </View>
                        ) : (
                            <View style={styles.placeholder}>
                                <MaterialCommunityIcons name="cloud-upload" size={40} color="#9CA3AF" />
                                <Text style={styles.placeholderText}>Select PDF Document</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, (!pdf || loading) && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={!pdf || loading}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Update</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#1F2937",
    },
    pdfPicker: {
        width: "100%",
        height: 140,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#F9FAFB",
    },
    placeholder: {
        alignItems: "center",
    },
    placeholderText: {
        marginTop: 8,
        color: "#6B7280",
        fontSize: 14,
    },
    pdfPreview: {
        alignItems: "center",
        padding: 10,
        width: '100%',
    },
    pdfName: {
        marginTop: 8,
        fontSize: 14,
        color: "#111827",
        textAlign: "center",
        width: '90%',
    },
    changeText: {
        marginTop: 4,
        fontSize: 12,
        color: "#007AFF",
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#374151",
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        borderRadius: 8,
        backgroundColor: "#007AFF",
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontWeight: "600",
    },
    disabledButton: {
        backgroundColor: "#93C5FD",
    },
});
