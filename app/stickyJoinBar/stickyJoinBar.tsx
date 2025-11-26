import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StickyJoinBarProps {
  price: number;
  onJoinPress: () => void;
}

export default function StickyJoinBar({
  price,
  onJoinPress,
}: StickyJoinBarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.5],
  });

  return (
    <View style={styles.container}>
      <View style={styles.textBox}>
        <Text style={styles.title}>Lifetime Access For ₹{price}/-</Text>
        <Text style={styles.subtitle}>
          Avoid costly mistakes in your farming journey
        </Text>
      </View>

      {/* glow layer */}
      <Animated.View style={[styles.glowLayer, { opacity: glowOpacity }]} />

      {/* button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={onJoinPress}>
          <Text style={styles.buttonText}>JOIN NOW</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 12,
    backgroundColor: "#FFF4CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  textBox: {
    width: "60%",
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
  },

  subtitle: {
    fontSize: 12,
    color: "#555",
  },

  glowLayer: {
    position: "absolute",
    right: 10,
    height: 50,
    width: 140,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
  },

  button: {
    marginRight: 15,
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
