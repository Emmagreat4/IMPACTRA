
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const INTERESTS_STORAGE_KEY = "impactra_interests";
const SKILLS_STORAGE_KEY = "impactra_skills";

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

const interestOptions = [
  "Education",
  "Environment",
  "Healthcare",
  "Community Development",
  "Youth",
  "Food & Poverty",
  "Technology",
  "Humanitarian Work",
];

const skillOptions = [
  "Graphic Design",
  "Teaching",
  "Photography",
  "Social Media",
  "Event Planning",
  "Coding",
  "Communication",
];

function parseSavedOptions(
  saved: string | null,
  allowedOptions: string[],
): string[] {
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved preference data is not a list.");
  }

  return [...new Set(
    parsed.filter(
      (item): item is string =>
        typeof item === "string" && allowedOptions.includes(item),
    ),
  )];
}

export default function InterestsScreen() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSelections() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [savedInterests, savedSkills] = await Promise.all([
          AsyncStorage.getItem(INTERESTS_STORAGE_KEY),
          AsyncStorage.getItem(SKILLS_STORAGE_KEY),
        ]);

        const interests = parseSavedOptions(
          savedInterests,
          interestOptions,
        );
        const skills = parseSavedOptions(savedSkills, skillOptions);

        if (!active) return;

        setSelectedInterests(interests);
        setSelectedSkills(skills);
      } catch (error) {
        console.error("Unable to load IMPACTRA preferences:", error);

        if (active) {
          setErrorMessage(
            "Saved preferences couldn't be loaded. You can select your preferences again and try saving.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSelections();

    return () => {
      active = false;
    };
  }, []);

  const toggleInterest = (item: string) => {
    setErrorMessage("");

    setSelectedInterests((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  };

  const toggleSkill = (item: string) => {
    setErrorMessage("");

    setSelectedSkills((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  };

  const handleContinue = async () => {
    if (loading || saving) return;

    setErrorMessage("");

    try {
      setSaving(true);

      await Promise.all([
        AsyncStorage.setItem(
          INTERESTS_STORAGE_KEY,
          JSON.stringify(selectedInterests),
        ),
        AsyncStorage.setItem(
          SKILLS_STORAGE_KEY,
          JSON.stringify(selectedSkills),
        ),
      ]);

      router.push("/availability");
    } catch (error) {
      console.error("Unable to save IMPACTRA preferences:", error);

      setErrorMessage(
        "Your preferences couldn't be saved on this device. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (saving) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  const renderOptions = (
    items: string[],
    selectedItems: string[],
    toggleItem: (item: string) => void,
  ) => (
    <View style={styles.options}>
      {items.map((item) => {
        const selected = selectedItems.includes(item);

        return (
          <Pressable
            key={item}
            onPress={() => toggleItem(item)}
            disabled={loading || saving}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                selected && styles.checkboxSelected,
              ]}
            >
              {selected ? (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={COLORS.white}
                />
              ) : null}
            </View>

            <Text
              style={[
                styles.optionText,
                selected && styles.optionTextSelected,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            disabled={saving}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back to profile"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.topBarTitle}>Your preferences</Text>

          <View style={styles.topBarSpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Image
              source={require("../../assets/images/impactra-logo.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="IMPACTRA logo"
            />

            <Text style={styles.brandName}>IMPACTRA</Text>
            <Text style={styles.tagline}>
              Connect, Contribute and Measure Impact
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressLabel}>
              Onboarding · Causes, interests and skills
            </Text>
          </View>

          <Text style={styles.title}>Causes & Interests</Text>

          <Text style={styles.subtitle}>
            Choose the causes you care about and the skills you can contribute.
            Select any options that genuinely reflect your interests.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Loading your saved preferences...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="heart-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.sectionHeadingContainer}>
                    <Text style={styles.sectionTitle}>
                      Causes you care about
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Select all that interest you.
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {selectedInterests.length}
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  interestOptions,
                  selectedInterests,
                  toggleInterest,
                )}

                <Text style={styles.selectionHint}>
                  {selectedInterests.length === 0
                    ? "No causes selected yet."
                    : `${selectedInterests.length} ${
                        selectedInterests.length === 1
                          ? "cause"
                          : "causes"
                      } selected`}
                </Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="construct-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.sectionHeadingContainer}>
                    <Text style={styles.sectionTitle}>
                      Your skills
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Choose skills you can genuinely contribute.
                    </Text>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {selectedSkills.length}
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  skillOptions,
                  selectedSkills,
                  toggleSkill,
                )}

                <Text style={styles.selectionHint}>
                  {selectedSkills.length === 0
                    ? "No skills selected yet."
                    : `${selectedSkills.length} ${
                        selectedSkills.length === 1 ? "skill" : "skills"
                      } selected`}
                </Text>
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
                  Your selections are saved on this device. They are your
                  stated preferences, not confirmed qualifications or a
                  guarantee that matching opportunities are available.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.pressed,
                  saving && styles.disabledButton,
                ]}
                onPress={() => void handleContinue()}
                disabled={saving}
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      Save & Continue
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color={COLORS.white}
                    />
                  </>
                )}
              </Pressable>

              <Pressable
                style={styles.backToProfile}
                onPress={handleBack}
                disabled={saving}
              >
                <Text style={styles.backToProfileText}>
                  Back to profile
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
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

  topBar: {
    minHeight: 58,
    paddingHorizontal: 18,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  topBarSpace: {
    width: 40,
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 35,
  },

  brand: {
    alignItems: "center",
    marginBottom: 22,
  },

  logo: {
    width: 51,
    height: 51,
  },

  brandName: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: COLORS.primary,
    marginTop: 4,
  },

  tagline: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 5,
    textAlign: "center",
  },

  progressContainer: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 23,
  },

  progressTrack: {
    height: 5,
    borderRadius: 4,
    backgroundColor: "#DDE8F8",
    overflow: "hidden",
  },

  progressFill: {
    width: "65%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  progressLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 8,
  },

  title: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 9,
    marginBottom: 23,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: "center",
  },

  section: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeadingContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 3,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  option: {
    minHeight: 42,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    paddingVertical: 8,
    gap: 8,
  },

  optionSelected: {
    backgroundColor: COLORS.paleBlue,
    borderColor: COLORS.primary,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#B4C2D5",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  optionText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.lightText,
  },

  optionTextSelected: {
    fontWeight: "700",
    color: COLORS.primaryDark,
  },

  selectionHint: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 13,
  },

  loadingContainer: {
    width: "100%",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
  },

  errorBox: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#F0C9C9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 13,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.error,
  },

  notice: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },

  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.lightText,
  },

  button: {
    width: "100%",
    maxWidth: 400,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  backToProfile: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginTop: 5,
  },

  backToProfileText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});
