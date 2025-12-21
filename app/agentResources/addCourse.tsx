import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CourseService } from "../api/course";

export default function AddCoursePage() {
  const [title, setTitle] = useState("");
  const [crop, setCrop] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
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
      formData.append('image', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const newCourse = await CourseService.addCourse(formData);
    setLoading(false);

    if (newCourse) {
      Alert.alert("Success", "Course added successfully.");
      router.replace({
        pathname: "/agentResources/editCourse",
        params: { courseId: newCourse.id },
      });
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Course</Text>

      <TextInput
        style={styles.input}
        placeholder="Course Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Crop"
        value={crop}
        onChangeText={setCrop}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Add Thumbnail</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.thumbnail} />}

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={handleAddCourse}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Add Course</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 20
  }
});
