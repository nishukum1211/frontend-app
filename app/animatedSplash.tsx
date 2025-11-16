import { useEffect } from "react";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1000); // <-- 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      exiting={FadeOut.duration(500)}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EAF4FF",
      }}
    >
      <Animated.Image
        entering={FadeInUp.duration(1200)}
        source={require("../assets/images/logo.png")}
        style={{ width: 280, height: 120 }}
      />
    </Animated.View>
  );
}
