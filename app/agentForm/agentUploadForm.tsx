import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AgentSellItemForm() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [descHn, setDescHn] = useState("");
  const [price, setPrice] = useState("");

  const [pdfFile, setPdfFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Pick PDF
  const pickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPdfFile(result.assets[0]);
    }
  };

  // Pick Image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission needed to choose image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageFile(result.assets[0].uri);
    }
  };

  // Submit API
  const handleSubmit = async () => {
    if (!name || !price || !imageFile) {
      alert("Name, Price, and Image are required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Optional
    formData.append("url", url);

    // Required
    formData.append("name", name);
    formData.append("content", "PDF");
    formData.append("price", price);

    // Optional text
    formData.append("desc", desc);
    formData.append("desc_hn", descHn);

    // Required image
    formData.append("image", {
      uri: imageFile,
      name: "image.jpg",
      type: "image/jpeg",
    } as any);

    // PDF optional
    if (pdfFile) {
      formData.append("pdf", {
        uri: pdfFile.uri,
        name: pdfFile.name || "file.pdf",
        type: "application/pdf",
      } as any);
    }

    try {
      const response = await fetch(
        "https://your-api-domain.com/agent/sell/item",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      alert("Item uploaded successfully!");
    } catch (err) {
      console.log("Error submitting:", err);
      alert("Failed to upload!");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sell Item Form</Text>

      <TextInput
        style={styles.input}
        placeholder="URL (optional)"
        value={url}
        onChangeText={setUrl}
      />

      <TextInput
        style={styles.input}
        placeholder="Name *"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
      />

      <TextInput
        style={styles.input}
        placeholder="Description Hindi"
        value={descHn}
        onChangeText={setDescHn}
      />

      <TextInput
        style={styles.input}
        placeholder="Price *"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TouchableOpacity style={styles.button} onPress={pickPDF}>
        <Text style={styles.buttonText}>
          {pdfFile ? "PDF Selected ✔" : "Upload PDF"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>
          {imageFile ? "Image Selected ✔" : "Upload Required Image *"}
        </Text>
      </TouchableOpacity>

      {imageFile && (
        <Image source={{ uri: imageFile }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {loading ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff", paddingTop: 70 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0066FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: { color: "#fff", textAlign: "center" },
  preview: {
    width: 120,
    height: 120,
    marginVertical: 10,
    borderRadius: 8,
  },
  submitButton: { backgroundColor: "green", padding: 14, borderRadius: 8 },
  submitText: { color: "#fff", textAlign: "center", fontSize: 18 },
});
