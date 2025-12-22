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
  isJoined?: boolean;
}

export default function StickyJoinBar({
  price,
  onJoinPress,
  isJoined,
}: StickyJoinBarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        // If joined, stop animations
        Animated.timing(scaleAnim, {
          toValue: isJoined ? 1 : 1.05,
          duration: 0,
          useNativeDriver: true,
        }),
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
        // If joined, stop animations
        Animated.timing(glowAnim, {
          toValue: isJoined ? 0 : 1,
          duration: 0,
          useNativeDriver: false,
        }),
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
    ).start(); // This will still be called but the values will be set to not animate if joined
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.5],
  });

  return (
    <View style={styles.container}>
      <View style={styles.textBox}>
        <Text style={styles.title}>
          Lifetime Access For <Text style={styles.priceText}>₹{price}/-</Text>
        </Text>

        {/* <Text style={styles.subtitle}>
          Avoid costly mistakes in your farming journey
        </Text> */}
      </View>

      {/* glow layer */}
      {!isJoined && (
        <Animated.View style={[styles.glowLayer, { opacity: glowOpacity }]} />
      )}

      {/* button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.button, isJoined && styles.joinedButton]}
          onPress={onJoinPress}
          disabled={isJoined}
        >
          <Text
            style={[styles.buttonText, isJoined && styles.joinedButtonText]}
          >
            {isJoined ? "JOINED" : "JOIN NOW"}
          </Text>
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
    padding: 15,
    backgroundColor: "#8B0000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },

  textBox: {
    width: "60%",
  },

  title: {
    fontWeight: "bold",
    fontSize: 14,
    color: "white",
  },

  subtitle: {
    fontSize: 12,
    color: "white",
  },

  glowLayer: {
    position: "absolute",
    right: 10,
    height: 50,
    width: 140,
    borderRadius: 10,
    backgroundColor: "white",
  },

  button: {
    marginRight: 15,
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 15,
  },

  joinedButton: {
    backgroundColor: "#D1D5DB", // A gray color to indicate it's disabled
  },

  joinedButtonText: {
    color: "#4B5563",
  },
  priceText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "white",
  },
});
