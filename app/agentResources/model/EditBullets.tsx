import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditBulletsProps {
    data: string; // JSON string of bullets
    onChange: (data: string) => void;
}

const EditBullets: React.FC<EditBulletsProps> = ({ data, onChange }) => {
    const bullets = JSON.parse(data || '[""]');

    const handleBulletChange = (text: string, index: number) => {
        const newBullets = [...bullets];
        newBullets[index] = text;
        onChange(JSON.stringify(newBullets));
    };

    const addBullet = () => {
        const newBullets = [...bullets, ''];
        onChange(JSON.stringify(newBullets));
    };

    const removeBullet = (index: number) => {
        if (bullets.length === 1) return; // Keep at least one
        const newBullets = bullets.filter((_: any, i: number) => i !== index);
        onChange(JSON.stringify(newBullets));
    };

    return (
        <View>
            {bullets.map((bullet: string, index: number) => (
                <View key={index} style={styles.bulletItem}>
                    <TextInput
                        style={styles.input}
                        value={bullet}
                        onChangeText={(text) => handleBulletChange(text, index)}
                        placeholder={`Bullet ${index + 1}`}
                        multiline
                    />
                    <TouchableOpacity onPress={() => removeBullet(index)} style={styles.removeButton}>
                        <Text>🗑️</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity onPress={addBullet} style={styles.addButton}>
                <Text>+ Add Bullet</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bulletItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6, fontSize: 16, flex: 1, textAlignVertical: 'top' },
    removeButton: { padding: 10, marginLeft: 10 },
    addButton: {
        backgroundColor: '#E6F4EA',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
});

export default EditBullets;