import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { FarmingContentType } from "./types";

interface FarmingContentItemModalProps {
  visible: boolean;
  contentType: FarmingContentType;
  initialValue: string | string[];
  onClose: () => void;
  onSave: (value: string | string[]) => void;
}

export default function FarmingContentItemModal({
  visible,
  contentType,
  initialValue,
  onClose,
  onSave,
}: FarmingContentItemModalProps) {
  const [paragraphValue, setParagraphValue] = useState("");
  const [bulletValues, setBulletValues] = useState<string[]>([""]);
  const [imageUri, setImageUri] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (contentType === "paragraph") {
      setParagraphValue(typeof initialValue === "string" ? initialValue : "");
      return;
    }

    if (contentType === "image") {
      setImageUri(typeof initialValue === "string" ? initialValue : "");
      return;
    }

    if (Array.isArray(initialValue)) {
      setBulletValues(initialValue.length > 0 ? initialValue : [""]);
      return;
    }

    setBulletValues([""]);
  }, [contentType, initialValue, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSavePress = () => {
    if (contentType === "paragraph") {
      onSave(paragraphValue.trim());
      return;
    }

    if (contentType === "image") {
      onSave(imageUri);
      return;
    }

    onSave(bulletValues.map((value) => value.trim()).filter(Boolean));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <Text style={styles.title}>Edit {contentType}</Text>

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.sheetScroll}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {contentType === "paragraph" ? (
                    <TextInput
                      multiline
                      placeholder="Write paragraph"
                      placeholderTextColor="#94A3B8"
                      value={paragraphValue}
                      onChangeText={setParagraphValue}
                      style={[styles.input, styles.textArea]}
                      onFocus={() => {
                        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
                      }}
                    />
                  ) : null}

                  {contentType === "image" ? (
                    <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                      <Text style={styles.imageBtnText}>{imageUri ? "Change Image" : "Pick Image"}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {(contentType === "bullet1" || contentType === "bullet2") ? (
                    <View>
                      {bulletValues.map((value, index) => (
                        <View key={index} style={styles.bulletRow}>
                          <TextInput
                            style={[styles.input, styles.bulletInput]}
                            placeholder={`Bullet ${index + 1}`}
                            placeholderTextColor="#94A3B8"
                            value={value}
                            onChangeText={(text) => {
                              const next = [...bulletValues];
                              next[index] = text;
                              setBulletValues(next);
                            }}
                            onFocus={() => {
                              setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              if (bulletValues.length === 1) {
                                return;
                              }
                              const next = bulletValues.filter((_, itemIndex) => itemIndex !== index);
                              setBulletValues(next);
                            }}
                            style={styles.removeBtn}
                          >
                            <Text style={styles.removeBtnText}>X</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setBulletValues((prev) => [...prev, ""])}
                      >
                        <Text style={styles.addBtnText}>+ Add bullet</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity style={[styles.footerBtn, styles.cancel]} onPress={onClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.footerBtn, styles.save]} onPress={onSavePress}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  keyboardAvoid: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 10,
    maxHeight: "80%",
  },
  sheetScroll: {
    flexGrow: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  imageBtn: {
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  imageBtnText: {
    color: "#075985",
    fontWeight: "700",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  bulletInput: {
    flex: 1,
  },
  removeBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  removeBtnText: {
    fontWeight: "700",
    color: "#991B1B",
  },
  addBtn: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  addBtnText: {
    fontWeight: "700",
    color: "#334155",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: "#F1F5F9",
  },
  save: {
    backgroundColor: "#0E7490",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "700",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
