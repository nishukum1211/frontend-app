import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface HeaderWithBackButtonProps {
  title: string;
  style?: ViewStyle;
}

const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({
  title,
  style,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.headerContainer, style]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={26} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 10,
    borderRadius: 20, // Half of width/height (40/2)
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f0f0f0", // A light gray background
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
});

export default HeaderWithBackButton;
