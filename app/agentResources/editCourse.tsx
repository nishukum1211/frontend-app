import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DraggableFlatList, {
  DragEndParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Course, CourseService, ItemInfo } from "../api/course";
import ContentEditModal from "./model/ContentEditModal";
import PdfUploadModal from "./model/PdfUploadModal";
import PdfViewerModal from "./model/PdfViewerModal";

type ContentType = "paragraph" | "image" | "bullet1" | "bullet2"


const ContentItem = ({
  courseId,
  item,
  index,
  onEdit,
  onDelete,
  drag,
  isActive,
}: {
  courseId: string;
  item: ItemInfo;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // When item.data changes for an image, we might need to fetch its URL.
    // This effect handles both direct URLs and file paths that need to be resolved via the service.
    if (item.content_type === 'image') {
      if (item.data.startsWith('http') || item.data.startsWith('file://')) {
        setImageUrl(item.data);
      } else {
        // If the image data is a file path that needs to be resolved by the backend,
        // fetch the URL. Consider adding a loading state specifically for the image.
        CourseService.getCourseFileUrl(courseId, item.data).then(setImageUrl);
      }
    }
  }, [courseId, item.content_type, item.data]);

  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[styles.contentItem, isActive && styles.contentItemActive]}
      >
        <View style={styles.contentItemHeader}>
          <Text style={styles.contentType}>{item.content_type}</Text>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Text>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.actionButton, styles.deleteButton]}>
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
        {item.content_type === 'image' ? (
          imageUrl ? <Image source={{ uri: imageUrl }} style={styles.contentImage} resizeMode="cover" /> : <ActivityIndicator />
        ) : (item.content_type === 'bullet1' || item.content_type === 'bullet2' ? (
          <View>
            {(Array.isArray(item.data) ? item.data : [])
              .reduce((acc: string[], bullet: string) => {
                try {
                  if (typeof bullet === 'string' && bullet.trim().startsWith('[') && bullet.trim().endsWith(']')) {
                    const parsed = JSON.parse(bullet);
                    if (Array.isArray(parsed)) {
                      return acc.concat(parsed);
                    }
                  }
                } catch { }
                return acc.concat(bullet);
              }, [])
              .map((bullet: string, idx: number) => (
                <Text key={idx} style={styles.contentBullet}>• {bullet}</Text>
              ))}
          </View>
        ) : (
          <Text style={styles.contentData}>{item.data}</Text>
        ))}
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export default function EditCoursePage() {
  const { courseId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation(); // Initialize useNavigation
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [crop, setCrop] = useState("");
  const [price, setPrice] = useState("");
  const [content, setContent] = useState<ItemInfo[]>([]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [isPdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [pdfViewerUri, setPdfViewerUri] = useState<string | null>(null);
  const [preparingPdf, setPreparingPdf] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemInfo | null>(null);
  const [editedContent, setEditedContent] = useState<string | string[]>("");

  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Fetch course details
  const fetchCourse = useCallback(async () => {
    setLoading(true);
    if (typeof courseId === 'string') {
      const courseToEdit = await CourseService.getCourse(courseId);
      if (courseToEdit) {
        setCourse(courseToEdit);
        setTitle(courseToEdit.title);
        setCrop(courseToEdit.crop);
        setPrice(courseToEdit.price.toString());
        setContent(courseToEdit.content);
      } else {
        Alert.alert("Error", "Course not found.");
        router.back();
      }
    }
    setLoading(false);
  }, [courseId, router]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Save course details
  const handleSave = useCallback(async () => {
    if (!course) return;

    setSaving(true);
    // Validate price input to ensure it's a valid number before parsing and sending.
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert("Error", "Price must be a valid number.");
      setSaving(false);
      return;
    }
    const payload = {
      title,
      crop,
      price: parseFloat(price),
      content,
    };
    console.log("Saving course data:", JSON.stringify(payload, null, 2));

    const success = await CourseService.updateCourse(course.id, payload);
    setSaving(false);

    if (success) {
      Alert.alert("Success", "Course details updated successfully.");
      router.back();
    } else {
      Alert.alert("Error", "Failed to update course.");
    }
  }, [course, title, crop, price, content, router]);

  const onAddContent = (type: ContentType) => {
    // For more robust temporary IDs, especially in scenarios with rapid additions,
    // consider using a dedicated UUID generation library (e.g., 'uuid' package) instead of Date.now().
    const newItem: ItemInfo = {
      id: `new-${Date.now()}`,
      content_type: type,
      data: (type === 'bullet1' || type === 'bullet2' ? [""] : "") as any, // Start with empty array for bullets
    };
    setEditedContent(newItem.data);
    setEditingItem(newItem);
    setModalVisible(true);
  };

  const onEditItem = (item: ItemInfo) => {
    setEditedContent(item.data);
    setEditingItem(item);
    setModalVisible(true);
  }

  const [uploading, setUploading] = useState(false);

  const onModalSave = async () => {
    if (!editingItem) return;
    if (!course) return;

    let finalData = editedContent;

    if (editingItem.content_type === 'bullet1' || editingItem.content_type === 'bullet2') {
      if (!Array.isArray(editedContent)) {
        Alert.alert("Error", "Bullet points content must be a list of strings.");
        return;
      }
      finalData = editedContent;
    } else if (editingItem.content_type === 'image' && typeof editedContent === 'string' && editedContent.startsWith('file://')) {
      setUploading(true);
      // The 'name' and 'type' fields for addPhoto might need to be more dynamic, e.g., extracted from the file URI.
      const imageUrl = await CourseService.addPhoto(course.id, {
        uri: editedContent,
        name: `image_${Date.now()}.jpg`,
        type: 'image/jpeg'
      });
      setUploading(false);
    }

    const updatedItem = { ...editingItem, data: finalData } as ItemInfo;
    const itemExists = content.some((item) => item.id === editingItem.id);

    if (itemExists) {
      setContent((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
    } else {
      setContent((prev) => [...prev, updatedItem]);
    }

    setModalVisible(false);
    setEditingItem(null);
    setEditedContent("");
  };

  const onDragEnd = ({ data }: DragEndParams<ItemInfo>) => {
    setContent(data);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this content item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => setContent((prev) => prev.filter((c) => c.id !== itemId)),
          style: "destructive",
        },
      ]
    );
  };

  const handlePdfUpdate = async (file: { uri: string; name: string; mimeType?: string }) => {
    if (!course) return;
    const success = await CourseService.updatePdf(course.id, {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/pdf',
    });
    if (success) {
      Alert.alert("Success", "PDF updated successfully.");
    } else {
      Alert.alert("Error", "Failed to update PDF.");
    }
  };

  const handleViewPdf = async () => {
    if (!course) return;
    setPreparingPdf(true);
    try {
      const url = await CourseService.getCoursePdfUrl(course.id);
      if (!url) {
        throw new Error("Failed to get PDF URL");
      }
      setPdfViewerUri(url);
      setPdfViewerVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to open PDF.");
    } finally {
      setPreparingPdf(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          style={{ marginRight: 15 }}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#059669" />
          ) : (
            <Text style={{ color: "#059669", fontSize: 16, fontWeight: "600" }}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      ),
      // Optionally, you can also set a title here if needed, or keep it from _layout.tsx
      // title: "Edit Course",
    });
  }, [navigation, handleSave, saving]);




  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" color="#007AFF" />;
  }

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={content}
        onDragEnd={onDragEnd}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.pdfButtonRow}>
              <TouchableOpacity style={[styles.pdfButton, { marginRight: 10 }]} onPress={() => setPdfModalVisible(true)}>
                <Text style={styles.pdfButtonText}>📄 Replace PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pdfButton} onPress={handleViewPdf}>
                <Text style={styles.pdfButtonText}>👁️ View</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailsHeader}>
              <Text style={styles.contentTitle}>Course Details</Text>
              <TouchableOpacity onPress={() => setIsEditingDetails(prev => !prev)}>
                <Text style={styles.editDetailsButtonText}>{isEditingDetails ? 'Cancel' : '✏️ Edit'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, !isEditingDetails && styles.disabledInput]}
              placeholder="Course Title"
              value={title}
              onChangeText={setTitle}
              editable={isEditingDetails}
            />
            <TextInput
              style={[styles.input, !isEditingDetails && styles.disabledInput]}
              placeholder="Crop"
              value={crop}
              onChangeText={setCrop}
              editable={isEditingDetails}
            />
            <TextInput
              style={[styles.input, !isEditingDetails && styles.disabledInput]}
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              editable={isEditingDetails}
            />
            <View style={styles.contentHeader}>
              <Text style={styles.contentTitle}>Content</Text>
            </View>
          </>
        }
        renderItem={({ item, drag, isActive }) => (
          <ContentItem
            item={item}
            courseId={course!.id}
            drag={drag}
            isActive={isActive}
            index={content.indexOf(item)}
            onEdit={() => onEditItem(item)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        style={styles.contentList}
        ListFooterComponent={
          <View style={styles.addContentButtons}>
            <TouchableOpacity style={styles.addContentButton} onPress={() => onAddContent("paragraph")}>
              <Text>+ Paragraph</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addContentButton} onPress={() => onAddContent("image")}>
              <Text>+ Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addContentButton} onPress={() => onAddContent("bullet1")}>
              <Text>+ Bullet1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addContentButton} onPress={() => onAddContent("bullet2")}>
              <Text>+ Bullet2</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.scrollContentContainer}
      />
      <ContentEditModal
        visible={isModalVisible}
        editingItem={editingItem}
        editedData={
          editingItem?.content_type === 'bullet1' || editingItem?.content_type === 'bullet2'
            ? JSON.stringify(editedContent)
            : Array.isArray(editedContent)
              ? editedContent.join('\n')
              : (editedContent as string)
        }
        uploading={uploading}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
        }}
        onSave={onModalSave}
        onEditedDataChange={(data: string) => {
          if (editingItem?.content_type === 'bullet1' || editingItem?.content_type === 'bullet2') {
            try {
              setEditedContent(JSON.parse(data));
            } catch (e) {
              console.error('Failed to parse bullets', e);
              setEditedContent([]);
            }
          } else {
            setEditedContent(data);
          }
        }}
      />
      <PdfUploadModal
        visible={isPdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
        onSave={handlePdfUpdate}
      />
      <PdfViewerModal
        visible={pdfViewerVisible}
        uri={pdfViewerUri}
        onClose={() => setPdfViewerVisible(false)}
      />
      {preparingPdf && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>Opening PDF...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", // A soft, light background
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 40, // Increased padding for scrollable content
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12, // More rounded corners
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: '#E0E0E0', // Lighter border
    shadowColor: "#000", // Subtle shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#777',
  },
  button: {
    backgroundColor: "#28A745", // A vibrant green for primary actions
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    shadowColor: "#28A745", // Shadow matching button color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  editDetailsButtonText: {
    color: '#007AFF', // Blue for edit actions
    fontWeight: '600',
    fontSize: 16,
    padding: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  contentTitle: {
    fontSize: 22, // Larger title
    fontWeight: '700',
    color: '#333',
  },
  addContentButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // Center buttons
    marginVertical: 25,
  },
  addContentButton: {
    backgroundColor: '#E6F4EA', // Light green background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: "#000", // Subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  contentList: {
    marginTop: 10
  },
  contentItem: {
    backgroundColor: 'white',
    padding: 18, // Increased padding
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentItemActive: {
    backgroundColor: '#E8F5E9', // Lighter green for active state
    elevation: 6,
    shadowOpacity: 0.15,
  },
  contentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap', // Allow wrapping for small screens
  },
  contentType: {
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  contentData: {
    marginTop: 5,
    color: '#555',
    fontSize: 15,
    lineHeight: 22, // Improved readability for paragraphs
  },
  contentBullet: {
    marginTop: 4,
    marginLeft: 15, // Indent bullets
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },
  contentImage: {
    width: '100%',
    height: 200, // Slightly larger images
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover', // Ensure image covers the area
  },
  actionButton: {
    marginLeft: 15,
    padding: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE', // Light red for delete
  },
  cancelButton: {
    backgroundColor: '#9E9E9E', // Grey for cancel
    shadowColor: "#9E9E9E",
  },
  deleteButtonText: {
    color: '#D32F2F', // Darker red for delete text
    fontWeight: '500',
  },
  pdfButtonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  pdfButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pdfButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
