import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  date: string;
  type: string;
  hours: string;
  description: string;
  responsibilities: string[];
  requirements: string;
  capacity: number;
  available: number;
};

type Application = {
  opportunityId: string;
  title: string;
  organization: string;
  status: "Submitted";
  appliedAt: string;
};

const APPLICATIONS_KEY = "impactra_applications";

const opportunityData: Opportunity[] = [
  {
    id: "1",
    title: "Community Health Outreach",
    organization: "Impact Health Initiative",
    category: "Healthcare",
    location: "Enugu",
    date: "Oct 10, 2026",
    type: "In-person",
    hours: "4 hrs",
    description:
      "Join a community health outreach focused on helping residents access basic health information and support. Volunteers will work with the organization team during the outreach and assist with community engagement.",
    responsibilities: [
      "Support community engagement activities",
      "Help participants access information",
      "Assist the project team during the outreach",
      "Submit your completed contribution after the activity",
    ],
    requirements:
      "No previous volunteering experience is required. Volunteers should be available for the full activity period and be willing to work with the community team.",
    capacity: 20,
    available: 12,
  },

  {
    id: "2",
    title: "Digital Skills for Youth",
    organization: "Future Forward Africa",
    category: "Technology",
    location: "Remote",
    date: "Oct 14, 2026",
    type: "Remote",
    hours: "6 hrs",
    description:
      "Help young people develop practical digital skills through guided learning sessions and online support. Volunteers will contribute to a structured digital learning programme.",
    responsibilities: [
      "Support learners during digital skills sessions",
      "Answer basic technology questions",
      "Assist with online learning activities",
      "Submit your completed contribution after the activity",
    ],
    requirements:
      "Basic digital skills and reliable internet access are recommended. Previous teaching experience is helpful but not required.",
    capacity: 25,
    available: 14,
  },

  {
    id: "3",
    title: "School Environmental Cleanup",
    organization: "Green Community Network",
    category: "Environment",
    location: "Enugu",
    date: "Oct 17, 2026",
    type: "In-person",
    hours: "3 hrs",
    description:
      "Take part in a community environmental cleanup focused on improving the school environment and encouraging responsible waste management.",
    responsibilities: [
      "Help clean designated school areas",
      "Support waste collection and sorting",
      "Encourage environmental awareness",
      "Submit your completed contribution after the activity",
    ],
    requirements:
      "Volunteers should be comfortable working outdoors and available for the full activity period.",
    capacity: 30,
    available: 18,
  },

  {
    id: "4",
    title: "After-School Reading Support",
    organization: "Bright Futures Foundation",
    category: "Education",
    location: "Enugu",
    date: "Oct 20, 2026",
    type: "In-person",
    hours: "2 hrs",
    description:
      "Support children with reading practice after school and help create a positive learning environment through guided reading activities.",
    responsibilities: [
      "Support children's reading activities",
      "Help learners practise reading",
      "Encourage participation and confidence",
      "Submit your completed contribution after the activity",
    ],
    requirements:
      "Volunteers should be patient, supportive and comfortable working with children.",
    capacity: 20,
    available: 9,
  },

  {
    id: "5",
    title: "Social Media Volunteer",
    organization: "Community Action Network",
    category: "Technology",
    location: "Remote",
    date: "Oct 22, 2026",
    type: "Remote",
    hours: "5 hrs",
    description:
      "Support a community organisation with social media activities that help communicate projects, volunteer opportunities and community impact.",
    responsibilities: [
      "Help prepare social media content",
      "Support community campaign updates",
      "Assist with simple social media tasks",
      "Submit your completed contribution after the activity",
    ],
    requirements:
      "Basic familiarity with social media platforms is recommended. Creativity and clear communication are helpful.",
    capacity: 20,
    available: 11,
  },
];

export default function OpportunityDetailsScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  const opportunity = useMemo(() => {
    const found = opportunityData.find(
      (item) => item.id === params.id
    );

    if (found) {
      return found;
    }

    return (
      opportunityData.find(
        (item) => item.title === params.title
      ) || opportunityData[0]
    );
  }, [params.id, params.title]);

  useEffect(() => {
    checkApplication();
  }, [opportunity.id]);

  const checkApplication = async () => {
    try {
      const saved = await AsyncStorage.getItem(APPLICATIONS_KEY);

      if (!saved) {
        setApplied(false);
        return;
      }

      const applications: Application[] = JSON.parse(saved);

      const existing = applications.some(
        (application) =>
          application.opportunityId === opportunity.id
      );

      setApplied(existing);
    } catch (error) {
      console.log("Unable to check application:", error);
      setApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);

      const saved = await AsyncStorage.getItem(APPLICATIONS_KEY);

      let applications: Application[] = [];

      if (saved) {
        try {
          applications = JSON.parse(saved);
        } catch {
          applications = [];
        }
      }

      const alreadyApplied = applications.some(
        (application) =>
          application.opportunityId === opportunity.id
      );

      if (alreadyApplied) {
        setApplied(true);

        Alert.alert(
          "Already applied",
          "You have already applied for this opportunity."
        );

        return;
      }

      const newApplication: Application = {
        opportunityId: opportunity.id,
        title: opportunity.title,
        organization: opportunity.organization,
        status: "Submitted",
        appliedAt: new Date().toISOString(),
      };

      applications.push(newApplication);

      await AsyncStorage.setItem(
        APPLICATIONS_KEY,
        JSON.stringify(applications)
      );

      setApplied(true);

      Alert.alert(
        "Application submitted",
        `Your application for ${opportunity.title} has been submitted successfully.`
      );
    } catch (error) {
      console.log("Application error:", error);

      Alert.alert(
        "IMPACTRA",
        "Your application could not be submitted. Please try again."
      );
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

  const percentageFilled =
    opportunity.capacity > 0
      ? ((opportunity.capacity - opportunity.available) /
          opportunity.capacity) *
        100
      : 0;

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
          Opportunity details
        </Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HERO */}
        <View style={styles.heroIcon}>
          <Ionicons
            name="briefcase-outline"
            size={32}
            color="#0958D9"
          />
        </View>

        <Text style={styles.title}>
          {opportunity.title}
        </Text>

        <Text style={styles.organization}>
          {opportunity.organization}
        </Text>

        <View style={styles.verifiedRow}>
          <View style={styles.verifiedDot} />

          <Text style={styles.verifiedText}>
            Verified organization
          </Text>
        </View>

        {/* QUICK DETAILS */}
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>
              Location
            </Text>

            <Text style={styles.detailValue}>
              {opportunity.location}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>
              Date
            </Text>

            <Text style={styles.detailValue}>
              {opportunity.date}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>
              Hours
            </Text>

            <Text style={styles.detailValue}>
              {opportunity.hours}
            </Text>
          </View>
        </View>

        {/* TYPE */}
        <View style={styles.typeRow}>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {opportunity.category}
            </Text>
          </View>

          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {opportunity.type}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About this opportunity
          </Text>

          <Text style={styles.bodyText}>
            {opportunity.description}
          </Text>
        </View>

        {/* RESPONSIBILITIES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What you will do
          </Text>

          {opportunity.responsibilities.map(
            (responsibility, index) => (
              <View
                key={index}
                style={styles.bulletRow}
              >
                <Text style={styles.bullet}>•</Text>

                <Text style={styles.bulletText}>
                  {responsibility}
                </Text>
              </View>
            )
          )}
        </View>

        {/* REQUIREMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Requirements
          </Text>

          <Text style={styles.bodyText}>
            {opportunity.requirements}
          </Text>
        </View>

        {/* CAPACITY */}
        <View style={styles.capacityCard}>
          <View>
            <Text style={styles.capacityLabel}>
              Volunteer capacity
            </Text>

            <Text style={styles.capacityValue}>
              {opportunity.available} spots available
            </Text>
          </View>

          <View style={styles.capacityBarBackground}>
            <View
              style={[
                styles.capacityBar,
                {
                  width: `${Math.max(
                    0,
                    Math.min(100, percentageFilled)
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* APPLY */}
        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            applied && styles.appliedButton,
            pressed && styles.pressed,
            loading && styles.loadingButton,
          ]}
          onPress={handleApply}
          disabled={applied || loading}
        >
          <Text
            style={[
              styles.applyButtonText,
              applied && styles.appliedButtonText,
            ]}
          >
            {loading
              ? "Checking..."
              : applied
              ? "Application submitted"
              : "Apply now"}
          </Text>

          {!applied && !loading ? (
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          ) : null}
        </Pressable>

        {/* APPLICATION STATUS */}
        {applied ? (
          <Pressable
            style={({ pressed }) => [
              styles.statusButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push("/application-status")
            }
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#0958D9"
            />

            <Text style={styles.statusText}>
              View application status
            </Text>
          </Pressable>
        ) : null}
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

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  title: {
    marginTop: 18,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  organization: {
    marginTop: 7,
    fontSize: 14,
    color: "#69737E",
    textAlign: "center",
  },

  verifiedRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  verifiedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
    marginRight: 6,
  },

  verifiedText: {
    fontSize: 11,
    color: "#4C6550",
    fontWeight: "500",
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E6EC",
    marginTop: 23,
    paddingVertical: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  detailItem: {
    flex: 1,
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 11,
    color: "#7A848F",
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  detailDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#E4E8ED",
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  typeTag: {
    backgroundColor: "#EAF2FF",
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  typeTagText: {
    fontSize: 10,
    color: "#174B9C",
    fontWeight: "600",
  },

  section: {
    marginTop: 27,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 10,
  },

  bodyText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#626D78",
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 9,
  },

  bullet: {
    fontSize: 17,
    color: "#0958D9",
    marginRight: 9,
    lineHeight: 20,
  },

  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#626D78",
  },

  capacityCard: {
    backgroundColor: "#EEF5FF",
    borderRadius: 13,
    padding: 16,
    marginTop: 26,
  },

  capacityLabel: {
    fontSize: 11,
    color: "#64758A",
  },

  capacityValue: {
    marginTop: 4,
    fontSize: 14,
    color: "#174B9C",
    fontWeight: "700",
  },

  capacityBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D4E2F7",
    marginTop: 12,
    overflow: "hidden",
  },

  capacityBar: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#0958D9",
  },

  applyButton: {
    width: "100%",
    height: 51,
    borderRadius: 8,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 25,
  },

  appliedButton: {
    backgroundColor: "#E5F3E7",
    borderWidth: 1,
    borderColor: "#A9D4AE",
  },

  loadingButton: {
    opacity: 0.7,
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 7,
  },

  appliedButtonText: {
    color: "#28632E",
    marginRight: 0,
  },

  statusButton: {
    width: "100%",
    height: 47,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#AFC1D0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 11,
  },

  statusText: {
    color: "#0958D9",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 7,
  },

  pressed: {
    opacity: 0.75,
  },
});