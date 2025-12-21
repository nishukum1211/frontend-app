import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EditImageProps {
    data: string;
    onChange: (uri: string) => void;
    uploading: boolean;
}

const EditImage: React.FC<EditImageProps> = ({ data, onChange, uploading }) => {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            onChange(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage} style={styles.button}>
                <Text>Pick an image from camera roll</Text>
            </TouchableOpacity>
            {uploading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                data && <Image source={{ uri: data }} style={styles.image} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#E6F4EA',
        padding: 10,
        borderRadius: 6,
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'cover',
    },
});

export default EditImage;