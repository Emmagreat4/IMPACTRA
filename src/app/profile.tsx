
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getUser, saveUser } from "../utils/storage";

const PROFILE_STORAGE_KEY = "impactra_profile";

const COLORS = {
  primary: "#155EEF",
  primaryDark: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EAF2FF",
  border: "#D9E3F0",
  text: "#172B4D",
  muted: "#718096",
  lightText: "#536985",
  error: "#C62828",
};

const educationOptions = [
  "Secondary School",
  "Diploma",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
  "Other",
];

const employmentOptions = [
  "Employed",
  "Student",
  "Self-employed",
  "Unemployed",
];

type ProfileData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  location?: string;
  city?: string;
  stateRegion?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  employmentStatus?: string;
};

type SavedUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  [key: string]: unknown;
};

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  const [educationOpen, setEducationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const [savedProfile, savedAccount] = await Promise.all([
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          getUser(),
        ]);

        let profile: ProfileData = {};

        if (savedProfile) {
          try {
            const parsed: unknown = JSON.parse(savedProfile);

            if (parsed && typeof parsed === "object") {
              profile = parsed as ProfileData;
            }
          } catch (error) {
            console.error("Unable to parse saved profile:", error);
          }
        }

        const account = savedAccount as SavedUser | null;

        const savedLocation =
          profile.location || account?.location || "";

        const locationParts = savedLocation
          .split(",")
          .map((part) => part.trim());

        if (!active) return;

        setFirstName(profile.firstName || account?.firstName || "");
        setLastName(profile.lastName || account?.lastName || "");
        setEmail(profile.email || account?.email || "");
        setBio(profile.bio || account?.bio || "");

        setCity(profile.city || locationParts[0] || "");

        setStateRegion(
          profile.stateRegion ||
            (locationParts.length > 1
              ? locationParts.slice(1).join(", ")
              : ""),
        );

        setEducationLevel(profile.educationLevel || "");
        setFieldOfStudy(profile.fieldOfStudy || "");
        setEmploymentStatus(profile.employmentStatus || "");
      } catch (error) {
        console.error("Unable to load profile:", error);

        if (active) {
          setErrorMessage(
            "Some saved information could not be loaded. You can review the fields and try saving again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async (continueNext: boolean) => {
    if (saving || loading) return;

    setErrorMessage("");

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage(
        "Your first and last name are required. Please check your account details.",
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const combinedLocation = [city.trim(), stateRegion.trim()]
        .filter(Boolean)
        .join(", ");

      const profile: ProfileData = {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        bio: bio.trim(),
        city: city.trim(),
        stateRegion: stateRegion.trim(),
        location: combinedLocation,
        educationLevel,
        fieldOfStudy: fieldOfStudy.trim(),
        employmentStatus,
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile),
      );

      const existingUser = (await getUser()) as SavedUser | null;

      if (existingUser) {
        await saveUser({
          ...existingUser,
          username: `${cleanFirstName} ${cleanLastName}`,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          bio: profile.bio,
          location: combinedLocation,
        });
      }

      if (continueNext) {
        router.push("/interests");
      } else {
        Alert.alert("Profile saved", "Your profile details were saved on this device.");
      }
    } catch (error) {
      console.error("Profile save error:", error);

      setErrorMessage(
        "Your profile could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/signup");
    }
  };

  const avatarInitials =
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`
      .toUpperCase() || "U";

  const fullName =
    `${firstName.trim()} ${lastName.trim()}`.trim() || "Your name";

  const renderChoice = (
    label: string,
    selected: boolean,
    onPress: () => void,
    icon?: React.ComponentProps<typeof Ionicons>["name"],
  ) => (
    <Pressable
      key={label}
      style={({ pressed }) => [
        styles.choiceButton,
        selected && styles.choiceButtonSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={loading || saving}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={selected ? COLORS.primary : COLORS.muted}
        />
      ) : null}

      <Text
        style={[
          styles.choiceText,
          selected && styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>

      {selected ? (
        <Ionicons
          name="checkmark-circle"
          size={17}
          color={COLORS.primary}
        />
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Create Profile</Text>

          <Pressable
            style={styles.skipButton}
            onPress={() => void saveProfile(true)}
            disabled={saving || loading}
          >
            <Text
              style={[
                styles.skipText,
                (saving || loading) && styles.disabledText,
              ]}
            >
              Skip for now
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/impactra-logo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />

            <View style={styles.brandTextGroup}>
              <Text style={styles.brandName}>IMPACTRA</Text>
              <Text style={styles.brandTagline}>
                Connect, Contribute and Measure Impact
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressLabel}>Profile setup</Text>
          </View>

          <View style={styles.identitySection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>

            <Text style={styles.name}>
              {loading ? "Loading profile..." : fullName}
            </Text>

            <Text style={styles.email}>
              {email || "Email not available"}
            </Text>

            <Text style={styles.avatarNote}>
              Your initials represent your profile for now.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionTitle}>About you</Text>
              <Text style={styles.characterCount}>{bio.length}/240</Text>
            </View>

            <Text style={styles.label}>BIO</Text>

            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Write a short introduction about yourself..."
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={240}
              textAlignVertical="top"
              editable={!loading && !saving}
              accessibilityLabel="Profile biography"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.helperText}>
              Add the city and region you choose to share.
            </Text>

            <View style={styles.locationRow}>
              <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>CITY</Text>

                <TextInput
                  style={styles.locationInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="words"
                  editable={!loading && !saving}
                />
              </View>

              <View style={styles.locationField}>
                <Text style={styles.fieldLabel}>STATE / REGION</Text>

                <TextInput
                  style={styles.locationInput}
                  value={stateRegion}
                  onChangeText={setStateRegion}
                  placeholder="Enter region"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="words"
                  editable={!loading && !saving}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View style={styles.headingIcon}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.headingTextGroup}>
                <Text style={styles.sectionTitle}>
                  Education and professional information
                </Text>
                <Text style={styles.helperText}>
                  These details are optional.
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Highest education level</Text>

            <Pressable
              style={styles.dropdown}
              onPress={() => setEducationOpen((value) => !value)}
              disabled={loading || saving}
              accessibilityRole="button"
              accessibilityState={{ expanded: educationOpen }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !educationLevel && styles.placeholder,
                ]}
              >
                {educationLevel || "Select education level"}
              </Text>

              <Ionicons
                name={educationOpen ? "chevron-up" : "chevron-down"}
                size={19}
                color={COLORS.muted}
              />
            </Pressable>

            {educationOpen ? (
              <View style={styles.dropdownOptions}>
                {educationOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.dropdownOption,
                      educationLevel === option &&
                        styles.dropdownOptionSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setEducationLevel(option);
                      setEducationOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        educationLevel === option &&
                          styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {educationLevel === option ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.primary}
                      />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>Field of study</Text>

            <View style={styles.iconInputContainer}>
              <Ionicons
                name="book-outline"
                size={18}
                color={COLORS.muted}
              />

              <TextInput
                style={styles.iconInput}
                value={fieldOfStudy}
                onChangeText={setFieldOfStudy}
                placeholder="Enter your field of study"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="words"
                editable={!loading && !saving}
              />
            </View>

            <Text style={styles.label}>Employment status</Text>

            <View style={styles.employmentGrid}>
              {employmentOptions.map((option) => {
                const selected = employmentStatus === option;

                const iconName: React.ComponentProps<
                  typeof Ionicons
                >["name"] =
                  option === "Employed"
                    ? "briefcase-outline"
                    : option === "Student"
                      ? "school-outline"
                      : option === "Self-employed"
                        ? "business-outline"
                        : "person-outline";

                return renderChoice(
                  option,
                  selected,
                  () => setEmploymentStatus(option),
                  iconName,
                );
              })}
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
            <Text style={styles.noticeText}>
              Your profile is saved on this device at the moment. Online
              account syncing and profile-photo uploads are not connected yet.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              (loading || saving) && styles.disabledButton,
            ]}
            onPress={() => void saveProfile(true)}
            disabled={loading || saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  Save and continue
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.white}
                />
              </>
            )}
          </Pressable>

          <Text style={styles.footer}>
            You can review or update your saved details later.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 58,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  skipButton: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  skipText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },

  disabledText: {
    opacity: 0.6,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 36,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 21,
    gap: 10,
  },

  brandLogo: {
    width: 43,
    height: 43,
  },

  brandTextGroup: {
    alignItems: "flex-start",
  },

  brandName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  brandTagline: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 3,
  },

  progressRow: {
    marginBottom: 25,
  },

  progressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDE8F8",
    overflow: "hidden",
  },

  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  progressLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
  },

  identitySection: {
    alignItems: "center",
    marginBottom: 27,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#DCE8FF",
  },

  avatarText: {
    fontSize: 27,
    fontWeight: "700",
    color: COLORS.white,
  },

  name: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
    textAlign: "center",
  },

  email: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
    textAlign: "center",
  },

  avatarNote: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
  },

  section: {
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.text,
    flexShrink: 1,
  },

  characterCount: {
    fontSize: 11,
    color: COLORS.muted,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 8,
  },

  helperText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    marginTop: 4,
  },

  bioInput: {
    minHeight: 100,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 11,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
  },

  locationRow: {
    flexDirection: "row",
    gap: 11,
    marginTop: 11,
  },

  locationField: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 3,
  },

  fieldLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 8,
  },

  locationInput: {
    minHeight: 37,
    fontSize: 12,
    color: COLORS.text,
    paddingVertical: 5,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 7,
  },

  headingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  headingTextGroup: {
    flex: 1,
    gap: 2,
  },

  dropdown: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 12,
    color: COLORS.text,
  },

  placeholder: {
    color: COLORS.muted,
  },

  dropdownOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 5,
    overflow: "hidden",
  },

  dropdownOption: {
    minHeight: 43,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownOptionSelected: {
    backgroundColor: COLORS.paleBlue,
  },

  dropdownOptionText: {
    fontSize: 12,
    color: COLORS.lightText,
  },

  dropdownOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  iconInputContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  iconInput: {
    flex: 1,
    marginLeft: 10,
    minHeight: 46,
    fontSize: 12,
    color: COLORS.text,
    paddingVertical: 7,
  },

  employmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 2,
  },

  choiceButton: {
    width: "48%",
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 7,
  },

  choiceButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.paleBlue,
  },

  choiceText: {
    fontSize: 12,
    color: COLORS.lightText,
    flexShrink: 1,
  },

  choiceTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    marginBottom: 13,
    borderRadius: 10,
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

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginBottom: 17,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 11,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.lightText,
  },

  primaryButton: {
    width: "100%",
    minHeight: 51,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 15,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    marginTop: 14,
    paddingHorizontal: 10,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});
