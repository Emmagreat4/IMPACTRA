
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

const AVAILABILITY_STORAGE_KEY = "impactra_availability";

const dayOptions = ["Weekdays", "Weekends"];
const timeOptions = ["Morning", "Afternoon", "Evening"];
const experienceOptions = ["Yes", "No"];
const volunteeringTypeOptions = ["In-person", "Remote", "Either"];

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

type AvailabilityData = {
  selectedDay: string;
  selectedTime: string;
  experience: string;
  volunteeringType: string;
};

const EMPTY_AVAILABILITY: AvailabilityData = {
  selectedDay: "",
  selectedTime: "",
  experience: "",
  volunteeringType: "",
};

function parseAvailability(saved: string | null): AvailabilityData {
  if (!saved) return { ...EMPTY_AVAILABILITY };

  const parsed: unknown = JSON.parse(saved);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Saved availability data is invalid.");
  }

  const data = parsed as Partial<AvailabilityData>;

  return {
    selectedDay:
      typeof data.selectedDay === "string" &&
      dayOptions.includes(data.selectedDay)
        ? data.selectedDay
        : "",
    selectedTime:
      typeof data.selectedTime === "string" &&
      timeOptions.includes(data.selectedTime)
        ? data.selectedTime
        : "",
    experience:
      typeof data.experience === "string" &&
      experienceOptions.includes(data.experience)
        ? data.experience
        : "",
    volunteeringType:
      typeof data.volunteeringType === "string" &&
      volunteeringTypeOptions.includes(data.volunteeringType)
        ? data.volunteeringType
        : "",
  };
}

type OptionCardProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
};

function OptionCard({
  label,
  icon,
  selected,
  onPress,
  disabled,
}: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
        disabled && styles.disabledOption,
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          selected && styles.optionIconSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={selected ? COLORS.primary : COLORS.muted}
        />
      </View>

      <Text
        style={[
          styles.optionText,
          selected && styles.optionTextSelected,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.selectionCircle,
          selected && styles.selectionCircleSelected,
        ]}
      >
        {selected ? (
          <Ionicons
            name="checkmark"
            size={13}
            color={COLORS.white}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function AvailabilityScreen() {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [experience, setExperience] = useState("");
  const [volunteeringType, setVolunteeringType] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      setLoading(true);
      setError("");

      try {
        const saved = await AsyncStorage.getItem(
          AVAILABILITY_STORAGE_KEY,
        );

        const data = parseAvailability(saved);

        if (!active) return;

        setSelectedDay(data.selectedDay);
        setSelectedTime(data.selectedTime);
        setExperience(data.experience);
        setVolunteeringType(data.volunteeringType);
      } catch (loadError) {
        console.error("Unable to load availability:", loadError);

        if (active) {
          setError(
            "We couldn't read your saved availability. Review your choices and try saving again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      active = false;
    };
  }, []);

  const updateChoice = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    setError("");
  };

  const handleFinish = async () => {
    if (loading || saving) return;

    setError("");

    if (!selectedDay || !selectedTime || !experience || !volunteeringType) {
      setError(
        "Please choose an answer for each section before finishing setup.",
      );
      return;
    }

    try {
      setSaving(true);

      const availability: AvailabilityData = {
        selectedDay,
        selectedTime,
        experience,
        volunteeringType,
      };

      await AsyncStorage.setItem(
        AVAILABILITY_STORAGE_KEY,
        JSON.stringify(availability),
      );

      router.replace("/home");
    } catch (saveError) {
      console.error("Unable to save availability:", saveError);

      setError(
        "Your availability couldn't be saved on this device. Please try again.",
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
      router.replace("/interests");
    }
  };

  const renderOptions = (
    items: string[],
    selectedValue: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    icons: Record<string, React.ComponentProps<typeof Ionicons>["name"]>,
  ) => (
    <View style={styles.options}>
      {items.map((item) => (
        <OptionCard
          key={item}
          label={item}
          icon={icons[item] ?? "ellipse-outline"}
          selected={selectedValue === item}
          onPress={() => updateChoice(setter, item)}
          disabled={loading || saving}
        />
      ))}
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
            accessibilityLabel="Go back to interests"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.topBarTitle}>Availability</Text>

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

          <View style={styles.stepLabelRow}>
            <View style={styles.stepDot} />
            <Text style={styles.stepLabel}>Final onboarding step</Text>
          </View>

          <Text style={styles.title}>When can you volunteer?</Text>

          <Text style={styles.subtitle}>
            Choose the times and volunteering format that fit your schedule.
            These are your preferences, and you can change them later.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />
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
                      name="calendar-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.headingContainer}>
                    <Text style={styles.sectionTitle}>
                      Available days
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Which days usually work best?
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  dayOptions,
                  selectedDay,
                  setSelectedDay,
                  {
                    Weekdays: "briefcase-outline",
                    Weekends: "sunny-outline",
                  },
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="time-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.headingContainer}>
                    <Text style={styles.sectionTitle}>
                      Preferred time
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      When are you usually available?
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  timeOptions,
                  selectedTime,
                  setSelectedTime,
                  {
                    Morning: "sunny-outline",
                    Afternoon: "partly-sunny-outline",
                    Evening: "moon-outline",
                  },
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="people-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.headingContainer}>
                    <Text style={styles.sectionTitle}>
                      Volunteering experience
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Have you volunteered before?
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  experienceOptions,
                  experience,
                  setExperience,
                  {
                    Yes: "checkmark-circle-outline",
                    No: "school-outline",
                  },
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="globe-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.headingContainer}>
                    <Text style={styles.sectionTitle}>
                      Volunteering format
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Where would you prefer to contribute?
                    </Text>
                  </View>
                </View>

                {renderOptions(
                  volunteeringTypeOptions,
                  volunteeringType,
                  setVolunteeringType,
                  {
                    "In-person": "people-outline",
                    Remote: "laptop-outline",
                    Either: "swap-horizontal-outline",
                  },
                )}
              </View>
            </>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
            <Text style={styles.noticeText}>
              Your availability is saved on this device. It will not be sent
              to an organization, and automatic opportunity matching is not
              connected yet.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              (loading || saving) && styles.disabledButton,
            ]}
            onPress={() => void handleFinish()}
            disabled={loading || saving}
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />
            ) : (
              <>
                <Text style={styles.buttonText}>Finish setup</Text>
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.white}
                />
              </>
            )}
          </Pressable>

          <Text style={styles.footer}>
            Your choices can be reviewed and changed later.
          </Text>
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
    fontSize: 16,
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
    paddingTop: 21,
    paddingBottom: 36,
  },

  brand: {
    alignItems: "center",
    marginBottom: 21,
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

  stepLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 10,
  },

  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  stepLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
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
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
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

  headingContainer: {
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

  options: {
    gap: 9,
  },

  option: {
    width: "100%",
    minHeight: 53,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  optionSelected: {
    backgroundColor: COLORS.paleBlue,
    borderColor: COLORS.primary,
  },

  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F6FA",
    alignItems: "center",
    justifyContent: "center",
  },

  optionIconSelected: {
    backgroundColor: COLORS.white,
  },

  optionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.lightText,
    fontWeight: "500",
  },

  optionTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  selectionCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#B8C8DD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  selectionCircleSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  loadingContainer: {
    width: "100%",
    minHeight: 250,
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
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    padding: 14,
    marginTop: 3,
    marginBottom: 17,
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

  footer: {
    maxWidth: 320,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.65,
  },

  disabledOption: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});
