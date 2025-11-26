import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

interface ScrollingTextProps {
  text: string;
  speed?: number;
  fontSize?: number;
  backgroundColor?: string;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({
  text,
  speed = 40,
  fontSize = 13,
  backgroundColor = "#2E7D32",
}) => {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(screenWidth)).current;

  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textWidth === 0) return;

    translateX.setValue(screenWidth);

    Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: textWidth * speed,
        useNativeDriver: true,
      })
    ).start();
  }, [textWidth]);

  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: "row",
          width: textWidth * 2 + 80, // important for smooth loop
        }}
      >
        {/* Real Text */}
        <Text
          style={[styles.text, { fontSize }]}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {text}
        </Text>

        {/* Invisible buffer clone (hidden behind space) */}
        <Text style={[styles.text, { fontSize, marginLeft: 10 }]}>{text}</Text>
      </Animated.View>
    </View>
  );
};

export default ScrollingText;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    overflow: "hidden",
    paddingVertical: 6,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    width: undefined, // important to allow full width
  },
});
