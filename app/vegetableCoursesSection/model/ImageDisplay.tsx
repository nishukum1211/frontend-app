import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { CourseService } from "../../api/course";

interface ImageDisplayProps {
    courseId: string;
    imageName: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ courseId, imageName }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchImage = async () => {
            // If the image name is already a valid URI (e.g. temp file), use it directly
            if (imageName.startsWith("file://") || imageName.startsWith("http")) {
                if (isMounted) {
                    setImageUri(imageName);
                    setLoading(false);
                }
                return;
            }

            // Otherwise, resolve it using the CourseService (downloads if needed)
            const uri = await CourseService.getCourseFileUrl(courseId, imageName);
            if (isMounted) {
                setImageUri(uri);
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
        };
    }, [courseId, imageName]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    }

    if (!imageUri) return null;

    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        minHeight: 200,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: 220,
    },
});

export default ImageDisplay;
