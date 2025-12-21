import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ItemInfo } from '../../api/course';
import EditBullets from './EditBullets';
import EditImage from './EditImage';
import EditParagraph from './EditParagraph';

interface ContentEditModalProps {
    visible: boolean;
    editingItem: ItemInfo | null;
    editedData: string;
    uploading: boolean;
    onClose: () => void;
    onSave: () => void;
    onEditedDataChange: (data: string) => void;
}

const ContentEditModal: React.FC<ContentEditModalProps> = ({
    visible,
    editingItem,
    editedData,
    uploading,
    onClose,
    onSave,
    onEditedDataChange,
}) => {
    const renderEditComponent = () => {
        if (!editingItem) return null;

        switch (editingItem.content_type) {
            case 'paragraph':
                return <EditParagraph data={editedData} onChange={onEditedDataChange} />;
            case 'bullet1':
            case 'bullet2':
                return <EditBullets data={editedData} onChange={onEditedDataChange} />;
            case 'image':
                return <EditImage data={editedData} onChange={onEditedDataChange} uploading={uploading} />;
            default:
                return <Text>Unsupported content type</Text>;
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit {editingItem?.content_type}</Text>

                    <View style={styles.editorContainer}>
                        {renderEditComponent()}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave} disabled={uploading}>
                            {uploading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    editorContainer: { width: '100%', marginBottom: 20 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: { backgroundColor: '#f44336' },
    saveButton: { backgroundColor: '#4CAF50' },
    buttonText: { color: 'white', fontWeight: 'bold' },
});

export default ContentEditModal;