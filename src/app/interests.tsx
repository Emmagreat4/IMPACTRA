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

const INTERESTS_STORAGE_KEY = "impactra_interests";
const SKILLS_STORAGE_KEY = "impactra_skills";

const interests = [
  "Education",
  "Environment",
  "Healthcare",
  "Community Development",
  "Youth",
  "Food & Poverty",
  "Technology",
  "Humanitarian Work",
];

const skills = [
  "Graphic Design",
  "Teaching",
  "Photography",
  "Social Media",
  "Event Planning",
  "Coding",
  "Communication",
];

export default function InterestsScreen() {
  const [selectedInterests, setSelectedInterests] =
    useState<string[]>([]);

  const [selectedSkills, setSelectedSkills] =
    useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      const [savedInterests, savedSkills] =
        await Promise.all([
          AsyncStorage.getItem(INTERESTS_STORAGE_KEY),
          AsyncStorage.getItem(SKILLS_STORAGE_KEY),
        ]);

      if (savedInterests) {
        try {
          const parsedInterests = JSON.parse(savedInterests);

          if (Array.isArray(parsedInterests)) {
            setSelectedInterests(parsedInterests);
          }
        } catch {
          setSelectedInterests([]);
        }
      }

      if (savedSkills) {
        try {
          const parsedSkills = JSON.parse(savedSkills);

          if (Array.isArray(parsedSkills)) {
            setSelectedSkills(parsedSkills);
          }
        } catch {
          setSelectedSkills([]);
        }
      }
    } catch (error) {
      console.log(
        "Unable to load interests and skills:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (item: string) => {
    setSelectedInterests((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  };

  const toggleSkill = (item: string) => {
    setSelectedSkills((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  };

  const handleContinue = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(
          INTERESTS_STORAGE_KEY,
          JSON.stringify(selectedInterests)
        ),
        AsyncStorage.setItem(
          SKILLS_STORAGE_KEY,
          JSON.stringify(selectedSkills)
        ),
      ]);

      router.push("/availability");
    } catch (error) {
      console.log(
        "Unable to save interests and skills:",
        error
      );
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  return (
    <ScrollView
      style={styles.screen}
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
          Your preferences
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
        Your interests & skills
      </Text>

      <Text style={styles.subtitle}>
        Help us understand the causes and skills{"\n"}
        that matter to you.
      </Text>

      {/* INTERESTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          What causes interest you?
        </Text>

        <View style={styles.options}>
          {interests.map((item) => {
            const selected =
              selectedInterests.includes(item);

            return (
              <Pressable
                key={item}
                onPress={() => toggleInterest(item)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#0958D9"
                    style={styles.checkIcon}
                  />
                )}

                <Text
                  style={[
                    styles.optionText,
                    selected &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* SKILLS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          What skills do you have?
        </Text>

        <View style={styles.options}>
          {skills.map((item) => {
            const selected =
              selectedSkills.includes(item);

            return (
              <Pressable
                key={item}
                onPress={() => toggleSkill(item)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#0958D9"
                    style={styles.checkIcon}
                  />
                )}

                <Text
                  style={[
                    styles.optionText,
                    selected &&
                      styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* CONTINUE */}
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
          Continue
        </Text>

        <Ionicons
          name="arrow-forward"
          size={19}
          color="#FFFFFF"
        />
      </Pressable>
    </ScrollView>
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
    marginBottom: 15,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
  },

  section: {
    width: "100%",
    maxWidth: 360,
    marginBottom: 27,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 13,
  },

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  option: {
    borderWidth: 1,
    borderColor: "#B7C7D5",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },

  optionSelected: {
    backgroundColor: "#EAF2FF",
    borderColor: "#0958D9",
  },

  checkIcon: {
    marginRight: 5,
  },

  optionText: {
    fontSize: 12,
    color: "#555555",
    flexShrink: 1,
  },

  optionTextSelected: {
    color: "#0958D9",
    fontWeight: "600",
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