
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { getUser, saveUser } from "../utils/storage";

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

type SignupUser = {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

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

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setNotice("");
  };

  const handleSignup = async () => {
    if (loading) return;

    Keyboard.dismiss();
    clearMessages();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const existingUser = (await getUser()) as SignupUser | null;

      if (
        existingUser?.email?.trim().toLowerCase() === cleanEmail
      ) {
        setErrorMessage(
          "An account with this email is already saved on this device. Please log in instead.",
        );
        return;
      }

      await saveUser({
        username: `${cleanFirstName} ${cleanLastName}`,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
      });

      const savedUser = (await getUser()) as SignupUser | null;

      if (
        !savedUser ||
        savedUser.email?.trim().toLowerCase() !== cleanEmail
      ) {
        throw new Error("Saved account could not be verified.");
      }

      router.replace("/profile");
    } catch (error) {
      console.error("IMPACTRA sign-up error:", error);

      setErrorMessage(
        "We couldn't save your account. Please try again. If the problem continues, check the terminal for an error.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProviderNotice = (provider: "Google" | "Apple") => {
    clearMessages();

    setNotice(
      `${provider} sign-up is not connected yet. Provider authentication must be configured before this option can create an account.`,
    );
  };

  const handleTerms = () => {
    setNotice(
      "The Terms and Conditions page is not available yet. The final legal terms must be added before public release.",
    );
  };

  const handlePrivacy = () => {
    setNotice(
      "The Privacy Policy page is not available yet. The final policy must explain how volunteer information is collected, stored and used before public release.",
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

          <Text style={styles.title}>Create an account</Text>

          <Text style={styles.subtitle}>
            Start your volunteering journey with IMPACTRA.
          </Text>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First name</Text>

              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  clearMessages();
                }}
                placeholder="First name"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                accessibilityLabel="First name"
              />
            </View>

            <View style={styles.nameField}>
              <Text style={styles.label}>Last name</Text>

              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={(value) => {
                  setLastName(value);
                  clearMessages();
                }}
                placeholder="Last name"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                accessibilityLabel="Last name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.inputWithIcon}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearMessages();
                }}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.muted}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.inputWithIcon}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  clearMessages();
                }}
                placeholder="Create a password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
                returnKeyType="next"
                accessibilityLabel="Password"
              />

              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                hitSlop={10}
                style={styles.eyeButton}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={
                    showPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              Use at least 6 characters.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.inputWithIcon}
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  clearMessages();
                }}
                placeholder="Enter your password again"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={() => void handleSignup()}
                accessibilityLabel="Confirm password"
              />

              <Pressable
                onPress={() =>
                  setShowConfirmPassword((value) => !value)
                }
                hitSlop={10}
                style={styles.eyeButton}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={20}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {notice ? (
            <View style={styles.noticeBox}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={COLORS.primary}
              />
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => void handleSignup()}
            disabled={loading}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>
                Create Account
              </Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={() => handleProviderNotice("Google")}
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <GoogleLogo />
            <Text style={styles.socialText}>
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleProviderNotice("Apple")}
            style={({ pressed }) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            <Ionicons
              name="logo-apple"
              size={22}
              color={COLORS.text}
            />
            <Text style={styles.socialText}>
              Continue with Apple
            </Text>
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace("/login")}
              hitSlop={8}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>

          <Text style={styles.legalText}>
            By creating an account, you acknowledge that the final{" "}
            <Text style={styles.legalLink} onPress={handleTerms}>
              Terms and Conditions
            </Text>{" "}
            and{" "}
            <Text style={styles.legalLink} onPress={handlePrivacy}>
              Privacy Policy
            </Text>{" "}
            still need to be published.
          </Text>

          <Text style={styles.footerNote}>
            Local development mode: account details are saved on this
            device. Secure online registration has not been connected yet.
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
    paddingHorizontal: 22,
    paddingVertical: 25,
  },

  content: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 22,
  },

  logoImage: {
    width: 48,
    height: 48,
  },

  brandName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginTop: 4,
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
    marginTop: 6,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 23,
  },

  nameRow: {
    flexDirection: "row",
    gap: 11,
    marginBottom: 15,
  },

  nameField: {
    flex: 1,
    minWidth: 0,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    fontSize: 12,
    color: COLORS.text,
  },

  inputContainer: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },

  inputWithIcon: {
    flex: 1,
    minWidth: 0,
    height: 47,
    paddingVertical: 0,
    paddingHorizontal: 10,
    fontSize: 12,
    color: COLORS.text,
  },

  eyeButton: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 6,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    marginTop: 2,
    marginBottom: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#F0C9C9",
    backgroundColor: "#FFF1F0",
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.error,
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    marginTop: 2,
    marginBottom: 12,
    borderRadius: 9,
    backgroundColor: COLORS.paleBlue,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.primaryDark,
  },

  createButton: {
    width: "100%",
    minHeight: 49,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 21,
    marginBottom: 15,
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

  socialButton: {
    width: "100%",
    minHeight: 49,
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

  socialText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
  },

  loginText: {
    fontSize: 11,
    color: COLORS.muted,
  },

  loginLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },

  legalText: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 17,
  },

  legalLink: {
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  footerNote: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});
