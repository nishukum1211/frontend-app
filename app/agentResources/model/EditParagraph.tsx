import React from 'react';
import { Dimensions, StyleSheet, TextInput } from 'react-native';

interface EditParagraphProps {
    data: string;
    onChange: (text: string) => void;
}

const EditParagraph: React.FC<EditParagraphProps> = ({ data, onChange }) => {
    return (
        <TextInput
            style={styles.input}
            value={data}
            onChangeText={onChange}
            placeholder="Enter paragraph text..."
            multiline
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 6,
        fontSize: 16,
        height: Dimensions.get('window').height * 0.6,
        textAlignVertical: 'top',
    },
});

export default EditParagraph;