import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type RouteParam = string | string[] | undefined;

type Application = {
  opportunityId: string;
  title: string;
  organization: string;
  status: string;
  appliedAt?: string;
};

type ContributionStatus =
  | "Submitted"
  | "Pending"
  | "Verified"
  | "Rejected";

type Contribution = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  date: string;
  hours: number;
  task: string;
  evidence: string;
  status: ContributionStatus;
  submittedAt: string;
};

const APPLICATIONS_KEY = "impactra_applications";
const CONTRIBUTIONS_KEY = "impactra_contributions";

const COLORS = {
  primary: "#155EEF",
  primaryDark: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EAF2FF",
  border: "#E0E7F0",
  text: "#172B4D",
  muted: "#718096",
  error: "#C62828",
};

function getParam(value: RouteParam): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readArray<T>(saved: string | null): T[] {
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function validateActivityDate(value: string): string {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return "Enter the activity date as DD/MM/YYYY.";
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) {
    return "Enter a valid activity date.";
  }

  const activityDate = new Date(year, month - 1, day);

  if (
    activityDate.getFullYear() !== year ||
    activityDate.getMonth() !== month - 1 ||
    activityDate.getDate() !== day
  ) {
    return "That date does not exist. Check the day, month and year.";
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (activityDate > today) {
    return "The activity date cannot be in the future.";
  }

  return "";
}

export default function LogHoursScreen() {
  const params = useLocalSearchParams<{
    opportunityId?: RouteParam;
    opportunityTitle?: RouteParam;
    organization?: RouteParam;
    correctionOf?: RouteParam;
  }>();

  const opportunityIdParam = getParam(params.opportunityId);
  const opportunityTitleParam = getParam(params.opportunityTitle);
  const organizationParam = getParam(params.organization);
  const correctionId = getParam(params.correctionOf);

  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [task, setTask] = useState("");
  const [evidence, setEvidence] = useState("");

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [correctionRecordFound, setCorrectionRecordFound] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadScreenData() {
      setLoading(true);
      setLoadError("");
      setError("");

      try {
        const [savedApplications, savedContributions] = await Promise.all([
          AsyncStorage.getItem(APPLICATIONS_KEY),
          AsyncStorage.getItem(CONTRIBUTIONS_KEY),
        ]);

        const applications = readArray<Application>(savedApplications);
        const contributions = readArray<Contribution>(savedContributions);

        const existingContribution = correctionId
          ? contributions.find((item) => item.id === correctionId)
          : undefined;

        let selectedApplication: Application | null = null;

        if (existingContribution) {
          selectedApplication = {
            opportunityId: existingContribution.opportunityId,
            title: existingContribution.opportunityTitle,
            organization: existingContribution.organization,
            status: "Submitted",
          };

          setDate(existingContribution.date ?? "");
          setHours(String(existingContribution.hours ?? ""));
          setTask(existingContribution.task ?? "");
          setEvidence(existingContribution.evidence ?? "");
        } else if (opportunityIdParam || opportunityTitleParam) {
          const matchingApplication = applications.find(
            (item) => item.opportunityId === opportunityIdParam
          );

          selectedApplication = matchingApplication ?? {
            opportunityId: opportunityIdParam,
            title: opportunityTitleParam,
            organization: organizationParam,
            status: "Submitted",
          };
        } else {
          selectedApplication = applications[applications.length - 1] ?? null;
        }

        if (cancelled) return;

        setApplication(selectedApplication);

        if (correctionId) {
          setCorrectionRecordFound(Boolean(existingContribution));

          if (!existingContribution) {
            setError(
              "The contribution to correct could not be found in this device's saved records."
            );
          }
        } else {
          setCorrectionRecordFound(null);
        }
      } catch (loadException) {
        console.error("Unable to load Log Hours data:", loadException);

        if (!cancelled) {
          setLoadError(
            "We couldn't load your saved information. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadScreenData();

    return () => {
      cancelled = true;
    };
  }, [
    opportunityIdParam,
    opportunityTitleParam,
    organizationParam,
    correctionId,
  ]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/contribution-history");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (correctionId && correctionRecordFound !== true) {
      setError(
        "This correction cannot be saved because the original contribution was not found."
      );
      return;
    }

    if (!application || !application.opportunityId || !application.title) {
      setError(
        "Choose an opportunity associated with your application before logging hours."
      );
      return;
    }

    const dateError = validateActivityDate(date);

    if (!date.trim()) {
      setError("Enter the date when you completed the activity.");
      return;
    }

    if (dateError) {
      setError(dateError);
      return;
    }

    if (!hours.trim()) {
      setError("Enter the number of hours you completed.");
      return;
    }

    const numericHours = Number(hours);

    if (
      !Number.isFinite(numericHours) ||
      numericHours <= 0 ||
      numericHours > 24
    ) {
      setError("Enter a number of hours greater than 0 and no more than 24.");
      return;
    }

    if (numericHours.toString().split(".")[1]?.length > 2) {
      setError("Enter hours to a maximum of two decimal places.");
      return;
    }

    if (!task.trim()) {
      setError("Describe the work you actually completed.");
      return;
    }

    if (task.trim().length < 10) {
      setError("Please provide a little more detail about the work completed.");
      return;
    }

    try {
      setSubmitting(true);

      const saved = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
      const contributions = readArray<Contribution>(saved);

      const now = new Date().toISOString();

      const contribution: Contribution = {
        id: correctionId || `${Date.now()}`,
        opportunityId: application.opportunityId,
        opportunityTitle: application.title,
        organization: application.organization ?? "",
        date: date.trim(),
        hours: numericHours,
        task: task.trim(),
        evidence: evidence.trim(),
        status: "Pending",
        submittedAt: now,
      };

      let updatedContributions: Contribution[];

      if (correctionId) {
        const originalIndex = contributions.findIndex(
          (item) => item.id === correctionId
        );

        if (originalIndex === -1) {
          setError(
            "The original contribution is no longer available. Reload the screen and try again."
          );
          return;
        }

        updatedContributions = [...contributions];
        updatedContributions[originalIndex] = contribution;
      } else {
        updatedContributions = [...contributions, contribution];
      }

      await AsyncStorage.setItem(
        CONTRIBUTIONS_KEY,
        JSON.stringify(updatedContributions)
      );

      Alert.alert(
        correctionId ? "Correction saved" : "Contribution saved",
        "This record is saved on this device only. It has not been sent to an organization or verified. Online submission will require the backend connection.",
        [
          {
            text: "View history",
            onPress: () => router.replace("/contribution-history"),
          },
        ]
      );
    } catch (submitException) {
      console.error("Contribution save error:", submitException);

      setError(
        "Your contribution could not be saved on this device. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openOpportunities = () => {
    router.push("/opportunities");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            {correctionId ? "Correct contribution" : "Log hours"}
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="time-outline"
                size={30}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.title}>
              {correctionId
                ? "Update your contribution"
                : "Record your contribution"}
            </Text>

            <Text style={styles.subtitle}>
              Record the activity you completed and the time you spent on it.
              Provide accurate information so it can be reviewed when online
              submission is available.
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Loading your saved information...
              </Text>
            </View>
          ) : loadError ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={COLORS.error}
              />
              <Text style={styles.errorCardText}>{loadError}</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.replace("/log-hours")}
              >
                <Text style={styles.secondaryButtonText}>Reload screen</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.opportunityCard}>
                <Text style={styles.smallLabel}>OPPORTUNITY</Text>

                {application ? (
                  <>
                    <Text style={styles.opportunityTitle}>
                      {application.title}
                    </Text>

                    {!!application.organization && (
                      <Text style={styles.organization}>
                        {application.organization}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.opportunityTitle}>
                      No opportunity selected
                    </Text>

                    <Text style={styles.organization}>
                      Select an opportunity associated with your application
                      before logging your contribution.
                    </Text>

                    <Pressable
                      style={styles.secondaryButton}
                      onPress={openOpportunities}
                    >
                      <Text style={styles.secondaryButtonText}>
                        View opportunities
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>Date of activity</Text>

                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numbers-and-punctuation"
                  editable={!submitting}
                  maxLength={10}
                  accessibilityLabel="Date of activity"
                />

                <Text style={styles.helperText}>
                  Use the date when you actually completed the activity.
                </Text>

                <Text style={styles.label}>Hours completed</Text>

                <TextInput
                  style={styles.input}
                  value={hours}
                  onChangeText={setHours}
                  placeholder="For example, 4 or 2.5"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                  accessibilityLabel="Hours completed"
                />

                <Text style={styles.label}>Task description</Text>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={task}
                  onChangeText={setTask}
                  placeholder="Describe the work you completed"
                  placeholderTextColor={COLORS.muted}
                  multiline
                  textAlignVertical="top"
                  editable={!submitting}
                  maxLength={1500}
                  accessibilityLabel="Task description"
                />

                <Text style={styles.label}>
                  Evidence reference{" "}
                  <Text style={styles.optional}>(optional)</Text>
                </Text>

                <TextInput
                  style={[styles.input, styles.textArea, styles.evidenceInput]}
                  value={evidence}
                  onChangeText={setEvidence}
                  placeholder="Paste an evidence link or enter a reference to your supporting document"
                  placeholderTextColor={COLORS.muted}
                  multiline
                  textAlignVertical="top"
                  editable={!submitting}
                  maxLength={1000}
                  accessibilityLabel="Evidence link or reference"
                />

                <Text style={styles.helperText}>
                  This field accepts a link or reference only. It does not
                  upload a photo or document.
                </Text>

                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
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

                  <View style={styles.noticeContent}>
                    <Text style={styles.noticeTitle}>
                      Before you save
                    </Text>

                    <Text style={styles.noticeText}>
                      Enter only work you actually completed. For now, this
                      form saves to your device. Online submission,
                      organization review, evidence uploads and verification
                      depend on the backend being connected.
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.pressed,
                    submitting && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting || loading}
                  accessibilityRole="button"
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons
                      name="save-outline"
                      size={19}
                      color={COLORS.white}
                    />
                  )}

                  <Text style={styles.submitText}>
                    {submitting
                      ? "Saving..."
                      : correctionId
                        ? "Save correction"
                        : "Save contribution"}
                  </Text>
                </Pressable>
              </View>
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

  header: {
    minHeight: 64,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },

  headerSpace: {
    width: 40,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  hero: {
    alignItems: "center",
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 15,
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: "center",
  },

  opportunityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginTop: 24,
  },

  smallLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "700",
    color: COLORS.muted,
  },

  opportunityTitle: {
    marginTop: 7,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.text,
  },

  organization: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
  },

  form: {
    marginTop: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 19,
  },

  optional: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.muted,
  },

  input: {
    minHeight: 49,
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#C8D4E3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  textArea: {
    minHeight: 110,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  evidenceInput: {
    minHeight: 90,
  },

  helperText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 6,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    padding: 15,
    marginTop: 22,
    gap: 10,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },

  noticeText: {
    color: "#536985",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF1F0",
    borderRadius: 10,
    padding: 12,
    gap: 9,
    marginTop: 15,
  },

  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },

  errorCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 20,
    marginTop: 24,
    gap: 12,
  },

  errorCardText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  loadingBox: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  secondaryButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.paleBlue,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 15,
    marginTop: 22,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },
});