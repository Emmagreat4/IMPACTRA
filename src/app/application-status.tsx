import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

type Application = {
  opportunityId: string;
  title: string;
  organization: string;
  status?: string;
  appliedAt?: string;
};

const APPLICATIONS_KEY = "impactra_applications";

const COLORS = {
  primary: "#155EEF",
  primaryDark: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EAF2FF",
  border: "#E0E7F0",
  text: "#172B4D",
  muted: "#718096",
  lightText: "#536985",
  error: "#C62828",
};

function parseApplications(saved: string | null): Application[] {
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved application data is not a list.");
  }

  return parsed
    .map((item: unknown): Application | null => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;

      const title =
        typeof record.title === "string"
          ? record.title.trim()
          : typeof record.opportunityTitle === "string"
            ? record.opportunityTitle.trim()
            : "";

      if (!title) return null;

      return {
        opportunityId:
          typeof record.opportunityId === "string"
            ? record.opportunityId
            : "",
        title,
        organization:
          typeof record.organization === "string"
            ? record.organization
            : "",
        status:
          typeof record.status === "string"
            ? record.status
            : undefined,
        appliedAt:
          typeof record.appliedAt === "string"
            ? record.appliedAt
            : undefined,
      };
    })
    .filter((item): item is Application => item !== null);
}

function getLatestApplication(
  applications: Application[],
): Application | null {
  if (applications.length === 0) return null;

  return applications.reduce((latest, current) => {
    const latestTime = latest.appliedAt
      ? Date.parse(latest.appliedAt)
      : Number.NaN;

    const currentTime = current.appliedAt
      ? Date.parse(current.appliedAt)
      : Number.NaN;

    if (
      Number.isFinite(currentTime) &&
      (!Number.isFinite(latestTime) || currentTime > latestTime)
    ) {
      return current;
    }

    return latest;
  }, applications[applications.length - 1]);
}

function formatApplicationDate(value?: string): string {
  if (!value) return "Not recorded";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not recorded";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationStatusScreen() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadApplication() {
        setLoading(true);
        setLoadError("");

        try {
          const saved = await AsyncStorage.getItem(APPLICATIONS_KEY);
          const applications = parseApplications(saved);
          const latestApplication = getLatestApplication(applications);

          if (active) {
            setApplication(latestApplication);
          }
        } catch (error) {
          console.error("Unable to load application status:", error);

          if (active) {
            setApplication(null);
            setLoadError(
              "We couldn't read your saved application. Please try again.",
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadApplication();

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/opportunities");
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
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={21} color={COLORS.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Application status</Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                Loading your saved application...
              </Text>
            </View>
          ) : loadError ? (
            <View style={styles.centerState}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color={COLORS.error}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Unable to load application
              </Text>

              <Text style={styles.emptyText}>{loadError}</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setReloadKey((value) => value + 1)}
              >
                <Ionicons name="refresh-outline" size={18} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : !application ? (
            <View style={styles.centerState}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>No saved application</Text>

              <Text style={styles.emptyText}>
                When you have an application saved in IMPACTRA, its details
                will appear here. Online application submission is not yet
                connected.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={openOpportunities}
              >
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color={COLORS.white}
                />
                <Text style={styles.primaryButtonText}>
                  Explore opportunities
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.hero}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.pageTitle}>Your application record</Text>

                <Text style={styles.pageDescription}>
                  Review the opportunity details saved on this device.
                </Text>

                <View style={styles.localBadge}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={15}
                    color={COLORS.primary}
                  />
                  <Text style={styles.localBadgeText}>Saved on this device</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>OPPORTUNITY</Text>

                <Text style={styles.opportunityTitle}>
                  {application.title}
                </Text>

                {application.organization ? (
                  <Text style={styles.organization}>
                    {application.organization}
                  </Text>
                ) : null}

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name="document-outline"
                      size={17}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Record status</Text>
                    <Text style={styles.detailValue}>Saved locally</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Application date</Text>
                    <Text style={styles.detailValue}>
                      {formatApplicationDate(application.appliedAt)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What happens next?</Text>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDotActive}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.white}
                      />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      Record saved on this device
                    </Text>
                    <Text style={styles.timelineText}>
                      The application details are stored locally in this
                      installation of IMPACTRA.
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={styles.timelineDotPending} />
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      Online submission and review
                    </Text>
                    <Text style={styles.timelineText}>
                      Not available yet. The backend must be connected before
                      the organization can receive the application and update
                      its status here.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.notice}>
                <View style={styles.noticeIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.noticeContent}>
                  <Text style={styles.noticeTitle}>
                    Your status is not confirmed online
                  </Text>
                  <Text style={styles.noticeText}>
                    A locally saved record does not confirm that an
                    organization received, reviewed, accepted or rejected
                    your application. Those updates require a working backend.
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={openOpportunities}
              >
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.secondaryButtonText}>
                  Explore opportunities
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
    paddingTop: 25,
    paddingBottom: 40,
  },

  hero: {
    alignItems: "center",
  },

  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 19,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 15,
    textAlign: "center",
  },

  pageDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    marginTop: 7,
    textAlign: "center",
  },

  localBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },

  localBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 17,
    marginTop: 25,
  },

  cardLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: "700",
    color: COLORS.muted,
  },

  opportunityTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
  },

  organization: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 17,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 91,
  },

  timelineLeft: {
    width: 25,
    alignItems: "center",
  },

  timelineDotActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  timelineDotPending: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#B8C8DD",
    marginTop: 4,
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#D6E3F5",
    marginVertical: 4,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 11,
    paddingBottom: 22,
  },

  timelineTitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: COLORS.text,
  },

  timelineText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 5,
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.paleBlue,
    borderRadius: 13,
    padding: 15,
    marginTop: 8,
    gap: 10,
  },

  noticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  noticeText: {
    color: COLORS.lightText,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },

  centerState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 430,
    paddingHorizontal: 12,
  },

  stateIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 18,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 9,
    maxWidth: 340,
  },

  loadingText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 13,
  },

  primaryButton: {
    minHeight: 49,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 8,
    marginTop: 23,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 49,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#C8D8EF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 22,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.75,
  },
});