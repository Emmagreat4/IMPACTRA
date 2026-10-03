import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, saveUser } from "../utils/storage";

const PROFILE_STORAGE_KEY = "impactra_profile";

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(
        PROFILE_STORAGE_KEY
      );

      const savedUser = await getUser();

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);

        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
      } else if (savedUser) {
        setFirstName(savedUser.firstName || "");
        setLastName(savedUser.lastName || "");
        setBio(savedUser.bio || "");
        setLocation(savedUser.location || "");
      }
    } catch (error) {
      console.log("Unable to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim(),
      location: location.trim(),
    };

    try {
      setLoading(true);

      // Save the full profile separately
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
      );

      // Also save the profile details to the main user account
      const existingUser = await getUser();

      if (existingUser) {
        await saveUser({
          ...existingUser,
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          location: profile.location,
        });
      }

      router.push("/interests");
    } catch (error) {
      console.log("Profile save error:", error);

      Alert.alert(
        "IMPACTRA",
        "Your profile could not be saved. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            hitSlop={10}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.topBarTitle}>Profile</Text>

          <View style={styles.topBarSpacer} />
        </View>

        {/* LOGO */}
        <Image
          source={require("../../assets/images/impactra-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create your profile</Text>

        <Text style={styles.subtitle}>
          Tell us a little about yourself.
        </Text>

        {/* PROFILE PHOTO */}
        <View style={styles.photoWrapper}>
          <View style={styles.photoCircle}>
            <Ionicons
              name="person-outline"
              size={31}
              color="#0958D9"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              pressed && styles.photoPressed,
            ]}
          >
            <Text style={styles.photoText}>
              Add profile photo
            </Text>
          </Pressable>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>First name</Text>

          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#8D99A6"
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Last name</Text>

          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#8D99A6"
            autoCapitalize="words"
            editable={!loading}
          />

          <Text style={styles.label}>Bio</Text>

          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us a little about yourself"
            placeholderTextColor="#8D99A6"
            multiline
            textAlignVertical="top"
            editable={!loading}
          />

          <Text style={styles.label}>Location</Text>

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor="#8D99A6"
            autoCapitalize="words"
            editable={!loading}
          />

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Continue"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 35,
  },

  topBar: {
    width: "100%",
    maxWidth: 350,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F5F8",
  },

  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  topBarSpacer: {
    width: 40,
  },

  logo: {
    width: 72,
    height: 72,
    marginTop: 8,
    marginBottom: 16,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#666666",
    marginTop: 7,
    textAlign: "center",
  },

  photoWrapper: {
    alignItems: "center",
    marginTop: 27,
    marginBottom: 18,
  },

  photoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#EEF5FF",
    borderWidth: 1,
    borderColor: "#B7CCE6",
    alignItems: "center",
    justifyContent: "center",
  },

  photoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#0958D9",
    fontWeight: "600",
  },

  photoPressed: {
    opacity: 0.65,
  },

  form: {
    width: "100%",
    maxWidth: 350,
  },

  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111111",
    marginBottom: 7,
    marginTop: 14,
  },

  input: {
    width: "100%",
    height: 49,
    borderWidth: 1,
    borderColor: "#AFC1D0",
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },

  bioInput: {
    height: 90,
    paddingTop: 13,
    paddingBottom: 13,
  },

  error: {
    color: "#D93025",
    fontSize: 12,
    marginTop: 10,
  },

  button: {
    width: "100%",
    height: 49,
    borderRadius: 7,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.75,
  },
});