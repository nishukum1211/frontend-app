import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseService } from "../api/course";

export default function AddCoursePage() {
  const [title, setTitle] = useState("");
  const [crop, setCrop] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pdf, setPdf] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddCourse = async () => {
    if (!title || !crop || !price) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("crop", crop);
    formData.append("price", price);
    if (image) {
      formData.append("thumbnail", {
        uri: image,
        name: "thumbnail.jpg",
        type: "image/jpeg",
      } as any);
    }
    if (images.length > 0) {
      images.forEach((imgUri, index) => {
        formData.append("images", {
          uri: imgUri,
          name: `image_${Date.now()}_${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });
    }
    if (pdf) {
      formData.append("pdf", {
        uri: pdf.uri,
        name: pdf.name,
        type: pdf.mimeType || "application/pdf",
      } as any);
    }

    const newCourse = await CourseService.addCourse(formData);
    setLoading(false);

    if (newCourse) {
      Alert.alert("Success", "Course added successfully.");
      router.back();
    } else {
      Alert.alert("Error", "Failed to add course. Please try again.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const pickPdf = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setPdf({ uri: file.uri, name: file.name, mimeType: file.mimeType });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <View style={styles.editIconContainer}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="white"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={48}
                  color="#9CA3AF"
                />
                <Text style={styles.placeholderText}>Select a Thumbnail</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Course Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Tomato Farming Masterclass"
                value={title}
                placeholderTextColor="#9CA3AF"
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Crop</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Tomato"
                value={crop}
                placeholderTextColor="#9CA3AF"
                onChangeText={setCrop}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 499"
                value={price}
                placeholderTextColor="#9CA3AF"
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Course Images</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesScrollContent}
              >
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImages}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={24}
                    color="#6B7280"
                  />
                  <Text style={styles.addImageText}>Add</Text>
                </TouchableOpacity>
                {images.map((img, index) => (
                  <View key={index} style={styles.smallImageContainer}>
                    <Image
                      source={{ uri: img }}
                      style={styles.smallImagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Course PDF</Text>
              <TouchableOpacity style={styles.pdfPicker} onPress={pickPdf}>
                {pdf ? (
                  <View style={styles.pdfPreview}>
                    <MaterialCommunityIcons
                      name="file-pdf-box"
                      size={32}
                      color="#EF4444"
                    />
                    <View style={styles.pdfInfo}>
                      <Text style={styles.pdfName} numberOfLines={1}>
                        {pdf.name}
                      </Text>
                      <Text style={styles.pdfChangeText}>Tap to change</Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setPdf(null);
                      }}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={24}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pdfPlaceholder}>
                    <MaterialCommunityIcons
                      name="cloud-upload"
                      size={32}
                      color="#9CA3AF"
                    />
                    <Text style={styles.pdfPlaceholderText}>
                      Upload PDF Document
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAddCourse}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Course</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  imagePicker: {
    height: 200,
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 32,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagesScrollContent: {
    alignItems: "center",
    paddingVertical: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F9FAFB",
  },
  addImageText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  smallImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  smallImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
  },
  pdfPicker: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    padding: 16,
  },
  pdfPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  pdfPlaceholderText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  pdfPreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  pdfInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pdfName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  pdfChangeText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
