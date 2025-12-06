import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AgentService } from "../api/agent";
import { crops } from "./crops";

export default function AgentSellItemForm({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [descHn, setDescHn] = useState("");
  const [price, setPrice] = useState("");
  const [crop, setCrop] = useState("");

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
    if (!name || !price || !imageFile || !crop) {
      alert("Name, Crop, Price, and Image are required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Required
    formData.append("name", name);
    formData.append("content", "PDF");
    formData.append("price", price);
    formData.append("crops", crop);

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
      const success = await AgentService.createResource(formData);

      if (success) {
        onUploadSuccess();
      } else {
        alert("Failed to upload!");
      }
    } catch (err) {
      console.log("Error submitting:", err);
      alert("Failed to upload!");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Sell Item Form</Text>

      <TextInput
        style={styles.input}
        placeholder="Name *"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Crop *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={crop}
            onValueChange={(itemValue) => setCrop(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select" value="" />
            {crops.map((c) => (
              <Picker.Item key={c.name} label={`${c.name} (${c.hindi})`} value={c.name} />
            ))}
          </Picker>
        </View>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
    color: "#1F2937",
  },
  input: {
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#F9FAFB",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerContainer: {
    flex: 1,
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#E5E7EB",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#1F2937",
    fontWeight: "600",
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
