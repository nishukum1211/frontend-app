import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ViewItemScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const item = JSON.parse(params.item as string);

  useEffect(() => {
    navigation.setOptions({ title: item.name });
  }, [navigation, item.name]);

  return (
    <View style={styles.container}>
      {/* The title is now in the header */}
      <Image
        source={{ uri: 'URL_TO_YOUR_IMAGE' }} // Replace with actual image URL
        style={styles.image}
      />
      <Text style={styles.description}>{item.desc_hn}</Text>
      <Text style={styles.price}>Price: ${item.price}</Text>
      {/* Add more details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
});
