
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import Svg, { Path } from "react-native-svg";
import { getUser } from "../utils/storage";

const COLORS = {
  primary: "#155EEF",
  primaryDark: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EAF2FF",
  border: "#D9E3F0",
  text: "#172B4D",
  muted: "#718096",
  error: "#C62828",
};

type StoredUser = {
  email?: unknown;
  password?: unknown;
};

/** Full-colour Google G logo */
function GoogleLogo() {
  return (
    <Svg width={24} height={24} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.71 7.18l7.61 5.9c4.44-4.1 7.14-10.15 7.14-17.55z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.9l-7.61-5.9c-2.11 1.41-4.81 2.24-8.3 2.24-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleLogin = async () => {
    setError("");
    setNotice("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const storedUser = (await getUser()) as StoredUser | null;

      if (
        !storedUser ||
        typeof storedUser.email !== "string" ||
        typeof storedUser.password !== "string"
      ) {
        setError(
          "No account was found on this device. Please create an account first.",
        );
        return;
      }

      if (
        storedUser.email.trim().toLowerCase() !== cleanEmail ||
        storedUser.password !== password
      ) {
        setError("The email address or password is incorrect.");
        return;
      }

      // This is local account checking, not secure online authentication.
      router.replace("/home");
    } catch (loginError) {
      console.error("IMPACTRA login error:", loginError);
      setError(
        "We couldn't check your saved account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError("");
    setNotice(
      "Password recovery is not connected yet. It requires the authentication backend.",
    );
  };

  const handleProviderNotice = (provider: "Google" | "Apple") => {
    setError("");
    setNotice(
      `${provider} sign-in is not connected yet. Provider authentication must be configured before you can use this option.`,
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/impactra-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="IMPACTRA logo"
            />

            <Text style={styles.brandName}>IMPACTRA</Text>

            <Text style={styles.tagline}>
              Connect, Contribute and Measure Impact
            </Text>
          </View>

          <Text style={styles.title}>Log in to your account</Text>

          <Text style={styles.description}>
            Welcome back. Continue your volunteering journey.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError("");
                  setNotice("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
            </View>
          </View>

          <View style={styles.passwordGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError("");
                  setNotice("");
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
                accessibilityLabel="Password"
              />

              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                style={styles.eyeButton}
                hitSlop={10}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleForgotPassword}
              style={styles.forgotButton}
              hitSlop={8}
              disabled={loading}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.messageError}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.messageNotice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={COLORS.primary}
              />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
            onPress={() => void handleLogin()}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </Pressable>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/signup")}
              hitSlop={8}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.providerButton,
              pressed && styles.pressed,
            ]}
            onPress={() => handleProviderNotice("Google")}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <GoogleLogo />

            <Text style={styles.providerButtonText}>
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.providerButton,
              pressed && styles.pressed,
            ]}
            onPress={() => handleProviderNotice("Apple")}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            <Ionicons
              name="logo-apple"
              size={22}
              color={COLORS.text}
              style={styles.appleIcon}
            />

            <Text style={styles.providerButtonText}>
              Continue with Apple
            </Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Local development mode. Secure online authentication has not
            been connected yet.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  content: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 29,
  },

  logoImage: {
    width: 58,
    height: 58,
  },

  brandName: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 5,
  },

  tagline: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
  },

  title: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 25,
  },

  inputGroup: {
    marginBottom: 17,
  },

  passwordGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: 49,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 47,
    fontSize: 13,
    color: COLORS.text,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },

  eyeButton: {
    minWidth: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },

  forgotText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
  },

  loginButton: {
    minHeight: 49,
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },

  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    gap: 5,
  },

  signupText: {
    fontSize: 11,
    color: COLORS.lightText,
  },

  signupLink: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 16,
    gap: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  orText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  providerButton: {
    minHeight: 49,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 11,
  },

  appleIcon: {
    marginRight: 0,
  },

  providerButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },

  messageError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF1F0",
    borderRadius: 9,
    padding: 11,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.error,
  },

  messageNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 9,
    padding: 11,
    marginBottom: 14,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primaryDark,
  },

  footerNote: {
    marginTop: 15,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});
