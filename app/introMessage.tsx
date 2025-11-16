import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function IntroMessage() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View
      style={{
        alignItems: "center",
        marginBottom: 10,
        paddingHorizontal: 20,
        marginTop: 30,
      }}
    >
      <Animated.Text
        style={[
          {
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 5,
          },
          animatedTextStyle,
        ]}
      >
        Welcome to AgroSmart!
      </Animated.Text>

      <Text
        style={{
          fontSize: 14,
          textAlign: "center",
          color: "#555",
        }}
      >
        Your digital companion for smarter food production, efficient farm
        management, and sustainable agriculture.
      </Text>
    </View>
  );
}
