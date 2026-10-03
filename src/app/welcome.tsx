import React from "react";
import {
  View,
  Image,
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();

  const logoWidth = Math.min(width * 0.52, 210);
  const logoHeight = logoWidth * 1.05;

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

      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.signupButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  buttons: {
    width: "100%",
    maxWidth: 300,
    marginTop: 55,
    gap: 22,
  },

  loginButton: {
    width: "100%",
    height: 48,
    borderRadius: 7,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },

  signupButton: {
    width: "100%",
    height: 48,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#A8C0D4",
    alignItems: "center",
    justifyContent: "center",
  },

  signupText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "500",
  },

  pressed: {
    opacity: 0.75,
  },
});