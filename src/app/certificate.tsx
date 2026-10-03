import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getUser } from "../utils/storage";

const CONTRIBUTIONS_KEY = "impactra_contributions";
const PROFILE_STORAGE_KEY = "impactra_profile";

type Contribution = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  date: string;
  hours: number;
  task: string;
  evidence: string;
  status: string;
  submittedAt: string;
};

type Profile = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
};

export default function CertificateScreen() {
  const [contribution, setContribution] =
    useState<Contribution | null>(null);

  const [volunteerName, setVolunteerName] =
    useState("Volunteer");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificateData();
  }, []);

  const loadCertificateData = async () => {
    try {
      const [savedContributions, savedProfile, savedUser] =
        await Promise.all([
          AsyncStorage.getItem(CONTRIBUTIONS_KEY),
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          getUser(),
        ]);

      let profile: Profile = {};

      if (savedProfile) {
        try {
          profile = JSON.parse(savedProfile);
        } catch {
          profile = {};
        }
      }

      if (profile.firstName || profile.lastName) {
        const fullName =
          `${profile.firstName || ""} ${
            profile.lastName || ""
          }`.trim();

        if (fullName) {
          setVolunteerName(fullName);
        }
      } else if (savedUser) {
        const fullName =
          `${savedUser.firstName || ""} ${
            savedUser.lastName || ""
          }`.trim();

        if (fullName) {
          setVolunteerName(fullName);
        } else if (savedUser.username) {
          setVolunteerName(savedUser.username);
        }
      }

      if (savedContributions) {
        try {
          const contributions: Contribution[] =
            JSON.parse(savedContributions);

          if (Array.isArray(contributions)) {
            const verified = contributions
              .filter(
                (item) =>
                  item.status === "Verified"
              )
              .reverse();

            if (verified.length > 0) {
              setContribution(verified[0]);
            }
          }
        } catch {
          setContribution(null);
        }
      }
    } catch (error) {
      console.log(
        "Unable to load certificate:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/my-profile");
    }
  };

  const handleDownload = () => {
    Alert.alert(
      "Certificate",
      "Certificate download will be connected to the backend certificate service."
    );
  };

  const handleShare = () => {
    Alert.alert(
      "Impact profile",
      "Your public impact profile will be connected when the sharing service is available."
    );
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Certificate
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>
            Loading certificate...
          </Text>
        </View>
      </View>
    );
  }

  if (!contribution) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Certificate
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.emptyContainer}
        >
          <View style={styles.emptyIcon}>
            <Ionicons
              name="ribbon-outline"
              size={35}
              color="#0958D9"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No verified certificate yet
          </Text>

          <Text style={styles.emptyText}>
            Your certificate becomes available after an
            organization verifies one of your contributions.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.replace(
                "/contribution-history"
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              View contribution history
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const activityDate = contribution.date || "N/A";

  const issueYear = contribution.submittedAt
    ? new Date(
        contribution.submittedAt
      ).getFullYear()
    : new Date().getFullYear();

  const certificateId =
    `IMP-${issueYear}-${contribution.id.slice(-6)}`;

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
          Certificate
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.pageTitle}>
          Your certificate
        </Text>

        <Text style={styles.pageDescription}>
          Verified proof of your contribution.
        </Text>

        {/* CERTIFICATE */}
        <View style={styles.certificate}>
          <View style={styles.topLine} />

          <Text style={styles.brand}>
            IMPACTRA
          </Text>

          <Text style={styles.certificateTitle}>
            CERTIFICATE OF
          </Text>

          <Text style={styles.certificateSubtitle}>
            VOLUNTEER CONTRIBUTION
          </Text>

          <View style={styles.divider} />

          <Text style={styles.presented}>
            This certificate is presented to
          </Text>

          <Text style={styles.volunteerName}>
            {volunteerName}
          </Text>

          <Text style={styles.body}>
            for successfully contributing volunteer service to
          </Text>

          <Text style={styles.organization}>
            {contribution.organization}
          </Text>

          <Text style={styles.body}>
            as part of the
          </Text>

          <Text style={styles.opportunity}>
            {contribution.opportunityTitle}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {contribution.hours}
              </Text>

              <Text style={styles.statLabel}>
                Verified hours
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {activityDate}
              </Text>

              <Text style={styles.statLabel}>
                Activity date
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {issueYear}
              </Text>

              <Text style={styles.statLabel}>
                Issue year
              </Text>
            </View>
          </View>

          <View style={styles.verificationBox}>
            <View style={styles.verifiedIcon}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#2E7D32"
              />
            </View>

            <View style={styles.verificationContent}>
              <Text style={styles.verificationTitle}>
                Verified contribution
              </Text>

              <Text style={styles.verificationText}>
                This record was verified by the participating
                organization.
              </Text>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signature}>
              <View style={styles.signatureLine} />

              <Text style={styles.signatureLabel}>
                Organization representative
              </Text>
            </View>

            <View style={styles.signature}>
              <View style={styles.signatureLine} />

              <Text style={styles.signatureLabel}>
                IMPACTRA
              </Text>
            </View>
          </View>

          <Text style={styles.certificateId}>
            Certificate ID: {certificateId}
          </Text>
        </View>

        {/* DOWNLOAD */}
        <Pressable
          style={({ pressed }) => [
            styles.downloadButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDownload}
        >
          <Ionicons
            name="download-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.downloadText}>
            Download certificate
          </Text>
        </Pressable>

        {/* SHARE */}
        <Pressable
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.pressed,
          ]}
          onPress={handleShare}
        >
          <Ionicons
            name="share-social-outline"
            size={18}
            color="#0958D9"
          />

          <Text style={styles.shareText}>
            Share my impact
          </Text>
        </Pressable>

        {/* HISTORY */}
        <Pressable
          style={({ pressed }) => [
            styles.historyButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.replace(
              "/contribution-history"
            )
          }
        >
          <Text style={styles.historyText}>
            Back to contribution history
          </Text>
        </Pressable>
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

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#6D7782",
  },

  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 45,
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
    textAlign: "center",
    marginTop: 18,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#69737E",
    textAlign: "center",
    maxWidth: 340,
    marginTop: 8,
  },

  primaryButton: {
    height: 50,
    paddingHorizontal: 20,
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

  container: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 45,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
  },

  pageDescription: {
    fontSize: 12,
    color: "#6D7782",
    marginTop: 6,
    marginBottom: 20,
  },

  certificate: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C9D5E1",
    borderRadius: 5,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    alignItems: "center",
  },

  topLine: {
    width: "100%",
    height: 4,
    backgroundColor: "#0958D9",
    borderRadius: 2,
    marginBottom: 20,
  },

  brand: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0958D9",
    letterSpacing: 1.2,
  },

  certificateTitle: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    letterSpacing: 1.5,
  },

  certificateSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#6E7781",
    letterSpacing: 1,
  },

  divider: {
    width: "55%",
    height: 1,
    backgroundColor: "#D7DEE6",
    marginVertical: 22,
  },

  presented: {
    fontSize: 10,
    color: "#7A848F",
  },

  volunteerName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    marginTop: 7,
    textAlign: "center",
  },

  body: {
    fontSize: 11,
    color: "#6E7781",
    marginTop: 10,
    textAlign: "center",
  },

  organization: {
    fontSize: 15,
    color: "#0958D9",
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },

  opportunity: {
    fontSize: 14,
    color: "#222222",
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEF1F4",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  statLabel: {
    fontSize: 9,
    color: "#7A848F",
    marginTop: 4,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#DCE2E8",
  },

  verificationBox: {
    width: "100%",
    backgroundColor: "#EEF5FF",
    borderRadius: 9,
    padding: 12,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  verifiedIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  verificationContent: {
    flex: 1,
    marginLeft: 9,
  },

  verificationTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#174B9C",
  },

  verificationText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#617083",
    marginTop: 4,
  },

  signatureRow: {
    width: "100%",
    flexDirection: "row",
    gap: 20,
    marginTop: 28,
  },

  signature: {
    flex: 1,
    alignItems: "center",
  },

  signatureLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#9BA6B1",
  },

  signatureLabel: {
    fontSize: 8,
    color: "#7A848F",
    marginTop: 6,
    textAlign: "center",
  },

  certificateId: {
    marginTop: 25,
    fontSize: 8,
    color: "#9AA3AD",
  },

  downloadButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
  },

  downloadText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 7,
  },

  shareButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#AFC1D0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  shareText: {
    color: "#0958D9",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 7,
  },

  historyButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  historyText: {
    color: "#666F79",
    fontSize: 12,
  },

  pressed: {
    opacity: 0.75,
  },
});