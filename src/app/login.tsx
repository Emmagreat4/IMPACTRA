import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getUser } from "../utils/storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("IMPACTRA", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await getUser();

      if (!user) {
        Alert.alert(
          "No Account Found",
          "Please create an account first."
        );
        return;
      }

      if (
        user.email.toLowerCase() !== cleanEmail ||
        user.password !== password
      ) {
        Alert.alert(
          "Login Failed",
          "Incorrect email or password."
        );
        return;
      }

      router.replace("/home");
    } catch (error) {
      Alert.alert(
        "IMPACTRA",
        "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Continue with Google",
      "Google authentication is not connected yet. Please use your email and password."
    );
  };

  const handleAppleLogin = () => {
    Alert.alert(
      "Continue with Apple",
      "Apple authentication is not connected yet."
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/impactra-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.brandName}>IMPACTRA</Text>

            <Text style={styles.tagline}>
              Connect, Contribute and Measure Impact
            </Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Sign in to continue your impact journey.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#777777"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Pressable
                onPress={() =>
                  setShowPassword((current) => !current)
                }
                hitSlop={10}
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color="#777777"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging In..." : "Login"}
            </Text>

            {!loading && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}
            onPress={handleGoogleLogin}
          >
            <FontAwesome5
              name="google"
              size={18}
              color="#4285F4"
              style={styles.socialIcon}
            />

            <Text style={styles.socialText}>
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}
            onPress={handleAppleLogin}
          >
            <Ionicons
              name="logo-apple"
              size={21}
              color="#111111"
              style={styles.socialIcon}
            />

            <Text style={styles.socialText}>
              Continue with Apple
            </Text>
          </Pressable>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.replace("/signup")}
              hitSlop={8}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>© 2026 IMPACTRA</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F7FC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  backgroundCircleTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#0958D9",
    opacity: 0.08,
    top: -80,
    right: -70,
  },

  backgroundCircleBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#0958D9",
    opacity: 0.06,
    bottom: -70,
    left: -70,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 30,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 25,
  },

  logoImage: {
    width: 88,
    height: 88,
    marginBottom: 5,
  },

  brandName: {
    fontSize: 27,
    fontWeight: "900",
    color: "#0958D9",
    letterSpacing: 1.5,
  },

  tagline: {
    fontSize: 11,
    color: "#888888",
    marginTop: 5,
    textAlign: "center",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111111",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 5,
    marginBottom: 23,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 7,
  },

  inputContainer: {
    height: 53,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E1E6EF",
    borderRadius: 13,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#111111",
    marginLeft: 10,
  },

  loginButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0958D9",
    borderRadius: 13,
    marginTop: 5,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginRight: 9,
  },

  disabledButton: {
    opacity: 0.7,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },

  orText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999999",
    marginHorizontal: 12,
  },

  socialButton: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  socialIcon: {
    marginRight: 10,
  },

  socialText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222222",
  },

  signupContainer: {
    alignItems: "center",
    marginTop: 10,
  },

  signupText: {
    fontSize: 13,
    color: "#777777",
  },

  signupLink: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0958D9",
    marginTop: 5,
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#999999",
    marginTop: 18,
  },

  pressed: {
    opacity: 0.75,
  },
});