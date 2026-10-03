import React, { useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  const { width } = useWindowDimensions();

  const logoWidth = Math.min(width * 0.42, 190);
  const logoHeight = logoWidth * 1.05;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/impactra-logo.png")}
        style={{
          width: logoWidth,
          height: logoHeight,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});