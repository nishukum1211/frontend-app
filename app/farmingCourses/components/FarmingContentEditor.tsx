import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  DragEndParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { fetchAndCacheBlobFile } from "../../api/common";
import {
  FarmingCourseService,
  TextContentPayload,
} from "../../api/farmingCourse";
import FarmingContentItemModal from "./FarmingContentItemModal";
import { FarmingContentItem, FarmingContentType } from "./types";

interface FarmingContentEditorProps {
  courseId: string;
  initialContent: FarmingContentItem[];
  onPersisted?: (content: FarmingContentItem[]) => void;
  onContentChange?: (content: FarmingContentItem[]) => void;
  listHeaderComponent?: React.ReactElement;
}

export default function FarmingContentEditor({
  courseId,
  initialContent,
  onPersisted,
  onContentChange,
  listHeaderComponent,
}: FarmingContentEditorProps) {
  const [content, setContent] = useState<FarmingContentItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState<FarmingContentType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    onContentChange?.(content);
  }, [content]);

  const editingItem = useMemo(
    () => content.find((item) => item.id === editingId) ?? null,
    [content, editingId]
  );

  const onDragEnd = ({ data }: DragEndParams<FarmingContentItem>) => {
    setContent(data);
  };

  const openAddModal = (contentType: FarmingContentType) => {
    const newId = `local-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const defaultData = contentType === "paragraph" || contentType === "image" ? "" : [""];
    setContent((prev) => [...prev, { id: newId, content_type: contentType, data: defaultData }]);
    setEditingId(newId);
    setModalType(contentType);
  };

  const addImageFromPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: `farming_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    const response = await FarmingCourseService.addFarmingCourseImageContent(courseId, formData);
    const imageItem = Array.isArray(response) ? response[0] : null;

    if (!imageItem) {
      Alert.alert("Error", "Unable to upload image.");
      return;
    }

    setContent((prev) => [
      ...prev,
      { id: imageItem.id, content_type: "image", data: imageItem.data },
    ]);
  };

  const openEditModal = (item: FarmingContentItem) => {
    if (item.content_type === "image") {
      replaceImage(item.id);
      return;
    }
    setEditingId(item.id);
    setModalType(item.content_type);
  };

  const replaceImage = async (itemId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: `farming_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    const response = await FarmingCourseService.addFarmingCourseImageContent(courseId, formData);
    const imageItem = Array.isArray(response) ? response[0] : null;

    if (!imageItem) {
      Alert.alert("Error", "Unable to replace image.");
      return;
    }

    setContent((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { id: imageItem.id, content_type: "image", data: imageItem.data }
          : item
      )
    );
  };

  const saveItemValue = (value: string | string[]) => {
    if (!editingId) return;
    setContent((prev) => prev.map((item) => (item.id === editingId ? { ...item, data: value } : item)));
    setModalType(null);
    setEditingId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this content item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setContent((prev) => prev.filter((row) => row.id !== itemId)),
        style: "destructive",
      },
    ]);
  };

  const persistContent = async () => {
    setSaving(true);
    try {
      const persistedItems: FarmingContentItem[] = [];

      for (const item of content) {
        if (item.content_type === "image") {
          // Images are already uploaded at add/edit time
          persistedItems.push(item);
          continue;
        }

        if (item.id.startsWith("local-")) {
          const payload: TextContentPayload[] = [{ content_type: item.content_type, data: item.data }];
          const textResponse = await FarmingCourseService.addFarmingCourseTextContent(courseId, payload);
          const textItem = Array.isArray(textResponse) ? textResponse[0] : null;

          if (!textItem) throw new Error("Unable to create text content.");

          persistedItems.push({ id: textItem.id, content_type: textItem.content_type, data: textItem.data });
          continue;
        }

        persistedItems.push(item);
      }

      const ordered = await FarmingCourseService.orderFarmingCourseContent(courseId, persistedItems as any);
      if (!ordered) throw new Error("Failed to persist order.");

      setContent(persistedItems);
      onPersisted?.(persistedItems);
      Alert.alert("Success", "Content updated successfully.");
    } catch (error) {
      console.error("Error while persisting farming content", error);
      Alert.alert("Error", "Failed to save content changes.");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item, drag, isActive }: { item: FarmingContentItem; drag: () => void; isActive: boolean }) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.itemCard, isActive && styles.itemCardActive]}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemType}>{item.content_type}</Text>
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => openEditModal(item)} style={styles.smallAction}>
              <Text style={styles.smallActionText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteItem(item.id)}
              style={[styles.smallAction, styles.deleteAction]}
            >
              <Text style={styles.deleteText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.content_type === "image" && typeof item.data === "string" && item.data !== "" ? (
          <FarmingImagePreview blobOrUri={item.data} />
        ) : null}

        {item.content_type === "paragraph" && typeof item.data === "string" ? (
          <Text style={styles.paragraphText}>{item.data}</Text>
        ) : null}

        {(item.content_type === "bullet1" || item.content_type === "bullet2") && Array.isArray(item.data)
          ? item.data.map((line, lineIndex) => (
              <Text key={`${item.id}-${lineIndex}`} style={styles.bulletText}>
                • {line}
              </Text>
            ))
          : null}
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={content}
        onDragEnd={onDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeaderComponent}
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <View style={styles.addRow}>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal("paragraph")}>
                <Text style={styles.addBtnText}>+ Paragraph</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal("bullet1")}>
                <Text style={styles.addBtnText}>+ Bullet 1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal("bullet2")}>
                <Text style={styles.addBtnText}>+ Bullet 2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={addImageFromPicker}>
                <Text style={styles.addBtnText}>+ Image</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={persistContent} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Content</Text>}
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {modalType && editingItem ? (
        <FarmingContentItemModal
          visible
          contentType={modalType}
          initialValue={editingItem.data}
          onClose={() => {
            setModalType(null);
            setEditingId(null);
          }}
          onSave={saveItemValue}
        />
      ) : null}
    </View>
  );
}

function FarmingImagePreview({ blobOrUri }: { blobOrUri: string }) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      if (blobOrUri.startsWith("file://") || blobOrUri.startsWith("http")) {
        setUri(blobOrUri);
      } else {
        const cached = await fetchAndCacheBlobFile(blobOrUri);
        if (active) setUri(cached);
      }
    };
    resolve();
    return () => { active = false; };
  }, [blobOrUri]);

  if (!uri) return <ActivityIndicator color="#0E7490" />;

  return <Image source={{ uri }} style={styles.contentImage} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  addRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginVertical: 16,
  },
  addBtn: {
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  addBtnText: {
    color: "#075985",
    fontWeight: "700",
    fontSize: 13,
  },
  footerWrap: {
    paddingVertical: 8,
  },
  itemCard: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemCardActive: {
    backgroundColor: "#E0F2FE",
    elevation: 6,
    shadowOpacity: 0.15,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemType: {
    fontWeight: "700",
    color: "#334155",
    textTransform: "capitalize",
    fontSize: 15,
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  smallAction: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  deleteAction: {
    backgroundColor: "#FFEBEE",
  },
  deleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D32F2F",
  },
  paragraphText: {
    color: "#0F172A",
    lineHeight: 22,
    fontSize: 15,
  },
  bulletText: {
    color: "#0F172A",
    marginBottom: 4,
    marginLeft: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  contentImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#E2E8F0",
  },
  saveBtn: {
    backgroundColor: "#0E7490",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 13,
    marginHorizontal: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
