import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageStyle, StyleProp, View } from "react-native";

interface ImageCarouselProps {
  images: number[]; // Array of image imports (require)
  duration?: number; // Time each image stays visible
  style?: StyleProp<ImageStyle>;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  duration = 2000,
  style,
}) => {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeIn = () =>
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      });

    const fadeOut = () =>
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      });

    fadeIn().start();

    const timer = setInterval(() => {
      fadeOut().start(() => {
        setIndex((prev) => (prev + 1) % images.length);
        fadeIn().start();
      });
    }, duration);

    return () => clearInterval(timer);
  }, [fadeAnim, images.length, duration]);

  return (
    <View>
      <Animated.Image
        source={images[index]}
        style={[{ opacity: fadeAnim }, style]}
        resizeMode="contain"
      />
    </View>
  );
};

export default ImageCarousel;
