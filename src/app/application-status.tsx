import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
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

const APPLICATIONS_KEY = "impactra_applications";

export default function ApplicationStatusScreen() {
  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] = useState(true);

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

      // Show the most recently submitted application
      const latestApplication =
        applications[applications.length - 1];

      setApplication(latestApplication);
    } catch (error) {
      console.log(
        "Unable to load application:",
        error
      );

      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/opportunities");
    }
  };

  const formattedDate = application?.appliedAt
    ? new Date(application.appliedAt).toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "";

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
          Application status
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {loading ? (
          <View style={styles.centerState}>
            <Text style={styles.loadingText}>
              Loading application...
            </Text>
          </View>
        ) : !application ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#0958D9"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No application found
            </Text>

            <Text style={styles.emptyText}>
              Apply for an opportunity first and your
              application status will appear here.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.replace("/opportunities")
              }
            >
              <Text style={styles.primaryButtonText}>
                Explore opportunities
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* STATUS */}
            <View style={styles.statusCircle}>
              <Ionicons
                name="time-outline"
                size={34}
                color="#C47D00"
              />
            </View>

            <Text style={styles.statusTitle}>
              Application pending
            </Text>

            <Text style={styles.statusDescription}>
              Your application has been sent to the
              organization. We will show you here when
              the status changes.
            </Text>

            {/* OPPORTUNITY */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>
                Opportunity
              </Text>

              <Text style={styles.opportunityTitle}>
                {application.title}
              </Text>

              <Text style={styles.organization}>
                {application.organization}
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    Status
                  </Text>

                  <Text style={styles.infoValue}>
                    Submitted
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    Applied
                  </Text>

                  <Text style={styles.infoValue}>
                    {formattedDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* PROGRESS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Application progress
              </Text>

              {/* SUBMITTED */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDotActive} />
                  <View style={styles.timelineLine} />
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Application submitted
                  </Text>

                  <Text style={styles.timelineText}>
                    Your application was successfully
                    submitted.
                  </Text>
                </View>
              </View>

              {/* REVIEW */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot} />
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Organization review
                  </Text>

                  <Text style={styles.timelineText}>
                    Your application is waiting for review.
                  </Text>
                </View>
              </View>
            </View>

            {/* INFORMATION CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#0958D9"
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoCardTitle}>
                  What happens next?
                </Text>

                <Text style={styles.infoCardText}>
                  The organization will review your
                  application. Once a decision is made,
                  your application status can be updated.
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.replace("/opportunities")
              }
            >
              <Text style={styles.secondaryButtonText}>
                Explore more opportunities
              </Text>
            </Pressable>
          </>
        )}
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
    paddingTop: 30,
    paddingBottom: 45,
  },

  centerState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 500,
    paddingHorizontal: 20,
  },

  loadingText: {
    fontSize: 14,
    color: "#69737E",
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
    marginTop: 18,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#69737E",
    textAlign: "center",
    marginTop: 9,
    maxWidth: 340,
  },

  statusCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFF5DF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  statusTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginTop: 18,
  },

  statusDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#69737E",
    textAlign: "center",
    marginTop: 9,
    maxWidth: 350,
    alignSelf: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6EC",
    borderRadius: 14,
    padding: 17,
    marginTop: 25,
  },

  cardLabel: {
    fontSize: 11,
    color: "#7A848F",
  },

  opportunityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginTop: 7,
    lineHeight: 21,
  },

  organization: {
    fontSize: 12,
    color: "#6C7680",
    marginTop: 4,
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: "#7A848F",
  },

  infoValue: {
    fontSize: 12,
    color: "#111111",
    fontWeight: "600",
    marginTop: 4,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 18,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 70,
  },

  timelineLeft: {
    width: 24,
    alignItems: "center",
  },

  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#D7DEE6",
    marginTop: 3,
  },

  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0958D9",
    marginTop: 3,
  },

  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: "#D8E0E8",
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },

  timelineTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },

  timelineText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#707A86",
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: "#EEF5FF",
    borderRadius: 13,
    padding: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#174B9C",
  },

  infoCardText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#64758A",
    marginTop: 4,
  },

  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  secondaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#AFC1D0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  secondaryButtonText: {
    color: "#0958D9",
    fontSize: 13,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.75,
  },
});