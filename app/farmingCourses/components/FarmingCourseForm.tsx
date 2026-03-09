import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FarmingCourseFormValues, UploadableFile } from "./types";

interface FarmingCourseFormProps {
  initialValues?: Partial<FarmingCourseFormValues>;
  submitLabel: string;
  loading: boolean;
  editable?: boolean;
  onSubmit: (values: FarmingCourseFormValues) => Promise<void>;
}

export default function FarmingCourseForm({ initialValues, submitLabel, loading, editable = true, onSubmit }: FarmingCourseFormProps) {
  const [cropName, setCropName] = useState(initialValues?.cropName ?? "");
  const [price, setPrice] = useState(
    typeof initialValues?.price === "number" ? String(initialValues.price) : ""
  );
  const [durationDays, setDurationDays] = useState(
    typeof initialValues?.duration_days === "number"
      ? String(initialValues.duration_days)
      : ""
  );
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<UploadableFile | undefined>(undefined);

  useEffect(() => {
    setCropName(initialValues?.cropName ?? "");
    setPrice(typeof initialValues?.price === "number" ? String(initialValues.price) : "");
    setDurationDays(
      typeof initialValues?.duration_days === "number" ? String(initialValues.duration_days) : ""
    );
  }, [initialValues?.cropName, initialValues?.duration_days, initialValues?.price]);

  const onPickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const file: UploadableFile = {
      uri: asset.uri,
      name: asset.fileName || `thumb_${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    };

    setThumbnailFile(file);
    setThumbnailUri(asset.uri);
  };

  const handleSubmit = async () => {
    if (!cropName.trim() || !price.trim() || !durationDays.trim()) {
      Alert.alert("Validation", "Crop, price and duration are required.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedDuration = Number(durationDays);

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedDuration)) {
      Alert.alert("Validation", "Price and duration must be numbers.");
      return;
    }

    await onSubmit({
      cropName: cropName.trim(),
      price: parsedPrice,
      duration_days: parsedDuration,
      thumbnailFile,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.thumbPicker} onPress={onPickThumbnail} disabled={!editable}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <Text style={styles.pickLabel}>Pick Thumbnail</Text>
        )}
      </TouchableOpacity>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Crop Name</Text>
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          placeholder="Enter crop name"
          placeholderTextColor="#94A3B8"
          value={cropName}
          onChangeText={setCropName}
          editable={editable}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          placeholder="Enter price"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          editable={editable}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Duration (days)</Text>
        <TextInput
          style={[styles.input, !editable && styles.disabledInput]}
          placeholder="Enter duration in days"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={durationDays}
          onChangeText={setDurationDays}
          editable={editable}
        />
      </View>

      {editable && (
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    margin: 14,
    gap: 12,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  thumbPicker: {
    height: 170,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  pickLabel: {
    color: "#475569",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#777",
  },
  submitBtn: {
    backgroundColor: "#0E7490",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
