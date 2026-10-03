import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AVAILABILITY_STORAGE_KEY = "impactra_availability";

const days = ["Weekdays", "Weekends"];
const times = ["Morning", "Afternoon", "Evening"];
const experienceOptions = ["Yes", "No"];
const volunteeringTypes = ["In-person", "Remote", "Either"];

export default function AvailabilityScreen() {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [experience, setExperience] = useState("");
  const [volunteeringType, setVolunteeringType] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        AVAILABILITY_STORAGE_KEY
      );

      if (saved) {
        try {
          const data = JSON.parse(saved);

          setSelectedDay(data.selectedDay || "");
          setSelectedTime(data.selectedTime || "");
          setExperience(data.experience || "");
          setVolunteeringType(
            data.volunteeringType || ""
          );
        } catch {
          console.log("Unable to read saved availability.");
        }
      }
    } catch (error) {
      console.log(
        "Unable to load availability:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setError("");

    if (
      !selectedDay ||
      !selectedTime ||
      !experience ||
      !volunteeringType
    ) {
      setError(
        "Please complete all availability questions before continuing."
      );
      return;
    }

    try {
      setSaving(true);

      const availability = {
        selectedDay,
        selectedTime,
        experience,
        volunteeringType,
      };

      await AsyncStorage.setItem(
        AVAILABILITY_STORAGE_KEY,
        JSON.stringify(availability)
      );

      router.replace("/home");
    } catch (error) {
      console.log(
        "Unable to save availability:",
        error
      );

      setError(
        "Your availability could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/interests");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.topBarTitle}>
            Availability
          </Text>

          <View style={styles.topBarSpace} />
        </View>

        {/* LOGO */}
        <Image
          source={require("../../assets/images/impactra-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Your availability
        </Text>

        <Text style={styles.subtitle}>
          Tell us when and how you would like{"\n"}
          to volunteer.
        </Text>

        {/* DAYS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            When are you available?
          </Text>

          <View style={styles.row}>
            {days.map((item) => {
              const selected = selectedDay === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedDay(item)}
                  style={({ pressed }) => [
                    styles.option,
                    styles.flexOption,
                    selected && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#0958D9"
                      style={styles.checkIcon}
                    />
                  )}

                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* TIME */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What time works best?
          </Text>

          <View style={styles.row}>
            {times.map((item) => {
              const selected = selectedTime === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedTime(item)}
                  style={({ pressed }) => [
                    styles.option,
                    styles.timeOption,
                    selected && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#0958D9"
                      style={styles.checkIcon}
                    />
                  )}

                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Have you volunteered before?
          </Text>

          <View style={styles.row}>
            {experienceOptions.map((item) => {
              const selected = experience === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setExperience(item)}
                  style={({ pressed }) => [
                    styles.option,
                    styles.smallOption,
                    selected && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#0958D9"
                      style={styles.checkIcon}
                    />
                  )}

                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* VOLUNTEERING TYPE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How would you prefer to volunteer?
          </Text>

          <View style={styles.row}>
            {volunteeringTypes.map((item) => {
              const selected =
                volunteeringType === item;

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setVolunteeringType(item)
                  }
                  style={({ pressed }) => [
                    styles.option,
                    styles.typeOption,
                    selected && styles.selectedOption,
                    pressed && styles.pressed,
                  ]}
                >
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#0958D9"
                      style={styles.checkIcon}
                    />
                  )}

                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ERROR */}
        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        {/* FINISH */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
            (loading || saving) &&
              styles.disabledButton,
          ]}
          onPress={handleFinish}
          disabled={loading || saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Continue"}
          </Text>

          {!saving && (
            <Ionicons
              name="arrow-forward"
              size={19}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  topBar: {
    width: "100%",
    maxWidth: 360,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  topBarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  topBarSpace: {
    width: 40,
  },

  logo: {
    width: 65,
    height: 65,
    marginBottom: 14,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    fontSize: 13,
    lineHeight: 20,
    color: "#666666",
    textAlign: "center",
  },

  section: {
    width: "100%",
    maxWidth: 360,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  option: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#B7C7D5",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
  },

  flexOption: {
    flex: 1,
    minWidth: 120,
  },

  timeOption: {
    flex: 1,
    minWidth: 95,
  },

  smallOption: {
    minWidth: 90,
  },

  typeOption: {
    minWidth: 95,
    flex: 1,
  },

  checkIcon: {
    marginRight: 5,
  },

  selectedOption: {
    backgroundColor: "#EAF2FF",
    borderColor: "#0958D9",
  },

  optionText: {
    fontSize: 12,
    color: "#555555",
  },

  selectedOptionText: {
    color: "#0958D9",
    fontWeight: "600",
  },

  error: {
    width: "100%",
    maxWidth: 360,
    color: "#D93025",
    fontSize: 12,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: 10,
  },

  button: {
    width: "100%",
    maxWidth: 360,
    height: 49,
    borderRadius: 7,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 7,
  },

  disabledButton: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.75,
  },
});