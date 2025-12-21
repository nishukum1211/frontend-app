import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ParagraphDisplayProps {
    text: string;
}

const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ text }) => {
    // CLEAN TEXT SPACING
    const cleanedText = text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .replace(/[^\S\r\n]+/g, " ")
        .trim();

    return (
        <View style={styles.container}>
            <Text style={styles.bodyText}>{cleanedText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        padding: 16,
    },
    bodyText: {
        fontSize: 15,
        lineHeight: 26,
        color: "#4a3b2d",
        textAlign: "justify",
    },
});

export default ParagraphDisplay;
