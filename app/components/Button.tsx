import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface CustomButtonProps {
  title: string;
  backgroundColor?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  backgroundColor = "#007bff",
  onPress,
  style,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: backgroundColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CustomButton;
