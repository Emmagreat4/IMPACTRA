import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type Application = {
  opportunityId: string;
  title: string;
  organization: string;
  status: "Submitted";
  appliedAt: string;
};

type Contribution = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  date: string;
  hours: number;
  task: string;
  evidence: string;
  status: "Pending verification";
  submittedAt: string;
};

const APPLICATIONS_KEY = "impactra_applications";
const CONTRIBUTIONS_KEY = "impactra_contributions";

export default function LogHoursScreen() {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [task, setTask] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        APPLICATIONS_KEY
      );

      if (!saved) {
        setApplication(null);
        return;
      }

      const applications: Application[] = JSON.parse(saved);

      if (!Array.isArray(applications) || applications.length === 0) {
        setApplication(null);
        return;
      }

      const latest =
        applications[applications.length - 1];

      setApplication(latest);
    } catch (error) {
      console.log(
        "Unable to load application:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!date.trim() || !hours.trim() || !task.trim()) {
      setError(
        "Please complete the date, hours, and task description."
      );
      return;
    }

    const numericHours = Number(hours);

    if (
      Number.isNaN(numericHours) ||
      numericHours <= 0
    ) {
      setError("Please enter a valid number of hours.");
      return;
    }

    if (numericHours > 24) {
      setError(
        "Hours cannot be more than 24 for one day."
      );
      return;
    }

    if (!application) {
      setError(
        "No application was found. Please apply for an opportunity first."
      );
      return;
    }

    try {
      setSubmitting(true);

      const saved = await AsyncStorage.getItem(
        CONTRIBUTIONS_KEY
      );

      let contributions: Contribution[] = [];

      if (saved) {
        try {
          contributions = JSON.parse(saved);

          if (!Array.isArray(contributions)) {
            contributions = [];
          }
        } catch {
          contributions = [];
        }
      }

      const newContribution: Contribution = {
        id: Date.now().toString(),
        opportunityId: application.opportunityId,
        opportunityTitle: application.title,
        organization: application.organization,
        date: date.trim(),
        hours: numericHours,
        task: task.trim(),
        evidence: evidence.trim(),
        status: "Pending verification",
        submittedAt: new Date().toISOString(),
      };

      contributions.push(newContribution);

      await AsyncStorage.setItem(
        CONTRIBUTIONS_KEY,
        JSON.stringify(contributions)
      );

      Alert.alert(
        "Contribution submitted",
        "Your contribution has been submitted and is now pending verification.",
        [
          {
            text: "View history",
            onPress: () =>
              router.replace(
                "/contribution-history"
              ),
          },
        ]
      );
    } catch (error) {
      console.log(
        "Contribution submission error:",
        error
      );

      Alert.alert(
        "IMPACTRA",
        "Your contribution could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/application-status");
    }
  };

  const handleEvidence = () => {
    setEvidence("Evidence selected");
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
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

        <Text style={styles.headerTitle}>
          Log hours
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="time-outline"
              size={30}
              color="#0958D9"
            />
          </View>

          <Text style={styles.title}>
            Submit your contribution
          </Text>

          <Text style={styles.subtitle}>
            Record the work you completed so it can be
            reviewed and added to your verified impact
            history.
          </Text>
        </View>

        {/* OPPORTUNITY */}
        <View style={styles.opportunityCard}>
          <Text style={styles.smallLabel}>
            Opportunity
          </Text>

          {loading ? (
            <Text style={styles.loadingText}>
              Loading opportunity...
            </Text>
          ) : application ? (
            <>
              <Text style={styles.opportunityTitle}>
                {application.title}
              </Text>

              <Text style={styles.organization}>
                {application.organization}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.opportunityTitle}>
                No opportunity selected
              </Text>

              <Text style={styles.organization}>
                Apply for an opportunity before logging hours.
              </Text>
            </>
          )}
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* DATE */}
          <Text style={styles.label}>
            Date of activity
          </Text>

          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#8D99A6"
            keyboardType="numbers-and-punctuation"
            editable={!submitting}
          />

          {/* HOURS */}
          <Text style={styles.label}>
            Hours completed
          </Text>

          <TextInput
            style={styles.input}
            value={hours}
            onChangeText={setHours}
            placeholder="e.g. 4"
            placeholderTextColor="#8D99A6"
            keyboardType="decimal-pad"
            editable={!submitting}
          />

          {/* TASK */}
          <Text style={styles.label}>
            Task description
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={task}
            onChangeText={setTask}
            placeholder="Describe the work you completed"
            placeholderTextColor="#8D99A6"
            multiline
            textAlignVertical="top"
            editable={!submitting}
          />

          {/* EVIDENCE */}
          <Text style={styles.label}>
            Evidence{" "}
            <Text style={styles.optional}>
              (optional)
            </Text>
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.uploadBox,
              pressed && styles.pressed,
            ]}
            onPress={handleEvidence}
            disabled={submitting}
          >
            <View style={styles.uploadIcon}>
              <Ionicons
                name={
                  evidence
                    ? "checkmark"
                    : "cloud-upload-outline"
                }
                size={20}
                color="#0958D9"
              />
            </View>

            <Text style={styles.uploadTitle}>
              {evidence || "Upload evidence"}
            </Text>

            <Text style={styles.uploadText}>
              Add a photo or document showing your
              contribution
            </Text>
          </Pressable>

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          {/* NOTICE */}
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              What happens next?
            </Text>

            <Text style={styles.noticeText}>
              Your submission will be sent to the
              organization for review. It will remain
              pending until the contribution is verified
              or rejected.
            </Text>
          </View>

          {/* SUBMIT */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              submitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting
                ? "Submitting..."
                : "Submit contribution"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  header: {
    height: 72,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EBF0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },

  headerSpace: {
    width: 40,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 45,
  },

  hero: {
    alignItems: "center",
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginTop: 15,
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: "#6C7680",
    textAlign: "center",
  },

  opportunityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E0E6EC",
    padding: 16,
    marginTop: 24,
  },

  smallLabel: {
    fontSize: 10,
    color: "#7A848F",
  },

  opportunityTitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#111111",
  },

  organization: {
    marginTop: 4,
    fontSize: 12,
    color: "#6C7680",
  },

  loadingText: {
    marginTop: 7,
    fontSize: 13,
    color: "#6C7680",
  },

  form: {
    marginTop: 21,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 7,
    marginTop: 17,
  },

  optional: {
    fontWeight: "400",
    color: "#7A848F",
  },

  input: {
    height: 49,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#AFC1D0",
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#111111",
  },

  textArea: {
    height: 105,
    paddingTop: 13,
    paddingBottom: 13,
  },

  uploadBox: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#AFC1D0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  uploadIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  uploadTitle: {
    fontSize: 13,
    color: "#0958D9",
    fontWeight: "600",
  },

  uploadText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#7A848F",
    textAlign: "center",
  },

  error: {
    color: "#D93025",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },

  notice: {
    backgroundColor: "#EEF5FF",
    borderRadius: 11,
    padding: 15,
    marginTop: 21,
  },

  noticeTitle: {
    color: "#174B9C",
    fontSize: 12,
    fontWeight: "700",
  },

  noticeText: {
    color: "#617083",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  submitButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.75,
  },
});