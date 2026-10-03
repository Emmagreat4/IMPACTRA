import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";

type Status =
  | "Submitted"
  | "Pending"
  | "Verified"
  | "Rejected";

type StoredContribution = {
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

type Contribution = {
  id: string;
  opportunity: string;
  organization: string;
  date: string;
  hours: string;
  numericHours: number;
  task: string;
  status: Status;
};

const CONTRIBUTIONS_KEY = "impactra_contributions";

const filters = [
  "All",
  "Submitted",
  "Pending",
  "Verified",
  "Rejected",
];

export default function ContributionHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      const saved = await AsyncStorage.getItem(
        CONTRIBUTIONS_KEY
      );

      if (!saved) {
        setContributions([]);
        return;
      }

      const parsed: StoredContribution[] = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setContributions([]);
        return;
      }

      const converted: Contribution[] = parsed.map((item) => {
        let normalizedStatus: Status = "Pending";

        if (item.status === "Verified") {
          normalizedStatus = "Verified";
        } else if (item.status === "Rejected") {
          normalizedStatus = "Rejected";
        } else if (item.status === "Submitted") {
          normalizedStatus = "Submitted";
        } else {
          normalizedStatus = "Pending";
        }

        return {
          id: item.id,
          opportunity:
            item.opportunityTitle || "Volunteer contribution",
          organization:
            item.organization || "Organization",
          date: item.date || "Date not provided",
          hours: `${item.hours} hrs`,
          numericHours: Number(item.hours) || 0,
          task:
            item.task || "No task description provided.",
          status: normalizedStatus,
        };
      });

      // Show newest contributions first
      converted.reverse();

      setContributions(converted);
    } catch (error) {
      console.log(
        "Unable to load contribution history:",
        error
      );

      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredContributions = useMemo(() => {
    if (selectedFilter === "All") {
      return contributions;
    }

    return contributions.filter(
      (item) => item.status === selectedFilter
    );
  }, [contributions, selectedFilter]);

  const totalHours = useMemo(() => {
    return contributions.reduce(
      (total, item) => total + item.numericHours,
      0
    );
  }, [contributions]);

  const verifiedCount = useMemo(() => {
    return contributions.filter(
      (item) => item.status === "Verified"
    ).length;
  }, [contributions]);

  const activityCount = contributions.length;

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "Verified":
        return {
          badge: styles.verifiedBadge,
          text: styles.verifiedText,
        };

      case "Rejected":
        return {
          badge: styles.rejectedBadge,
          text: styles.rejectedText,
        };

      case "Pending":
        return {
          badge: styles.pendingBadge,
          text: styles.pendingText,
        };

      default:
        return {
          badge: styles.submittedBadge,
          text: styles.submittedText,
        };
    }
  };

  const handleResubmit = (item: Contribution) => {
    Alert.alert(
      "Resubmit contribution",
      `You can review and resubmit your contribution for ${item.opportunity}.`
    );
  };

  const renderContribution = ({
    item,
  }: {
    item: Contribution;
  }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons
              name="document-text-outline"
              size={19}
              color="#0958D9"
            />
          </View>

          <View style={styles.titleArea}>
            <Text style={styles.opportunityTitle}>
              {item.opportunity}
            </Text>

            <Text style={styles.organization}>
              {item.organization}
            </Text>
          </View>

          <View style={statusStyle.badge}>
            <Text style={statusStyle.text}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* DATE + HOURS */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Date
            </Text>

            <Text style={styles.infoValue}>
              {item.date}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Hours
            </Text>

            <Text style={styles.infoValue}>
              {item.hours}
            </Text>
          </View>
        </View>

        {/* TASK */}
        <View style={styles.taskRow}>
          <Text style={styles.taskLabel}>
            Task:
          </Text>

          <Text style={styles.taskText}>
            {item.task}
          </Text>
        </View>

        {/* VERIFIED */}
        {item.status === "Verified" && (
          <View style={styles.messageBoxVerified}>
            <View style={styles.messageContent}>
              <Text style={styles.messageTextVerified}>
                Verified and counted in your impact history.
              </Text>

              <Pressable
                onPress={() => router.push("/certificate")}
              >
                <Text style={styles.linkVerified}>
                  Certificate
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* REJECTED */}
        {item.status === "Rejected" && (
          <View style={styles.messageBoxRejected}>
            <View style={styles.messageContent}>
              <Text style={styles.messageTextRejected}>
                This contribution was rejected and can be corrected.
              </Text>

              <Pressable
                onPress={() => handleResubmit(item)}
              >
                <Text style={styles.linkRejected}>
                  Resubmit
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.main}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/home")}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Contribution history
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.content}>
          {/* PAGE TITLE */}
          <Text style={styles.pageTitle}>
            Your contributions
          </Text>

          <Text style={styles.pageDescription}>
            Track your volunteer work and verification status.
          </Text>

          {/* SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {totalHours}
              </Text>

              <Text style={styles.summaryLabel}>
                Total hours
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {verifiedCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Verified
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {activityCount}
              </Text>

              <Text style={styles.summaryLabel}>
                Activities
              </Text>
            </View>
          </View>

          {/* FILTERS */}
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const selected =
                selectedFilter === item;

              return (
                <Pressable
                  onPress={() =>
                    setSelectedFilter(item)
                  }
                  style={({ pressed }) => [
                    styles.filter,
                    selected && styles.filterActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />

          {/* CONTRIBUTIONS */}
          {loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                Loading contributions...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredContributions}
              keyExtractor={(item) => item.id}
              renderItem={renderContribution}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={28}
                      color="#0958D9"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No contributions found
                  </Text>

                  <Text style={styles.emptyText}>
                    {contributions.length === 0
                      ? "Submit a contribution after completing a volunteer activity and it will appear here."
                      : "Contributions matching this filter will appear here."}
                  </Text>

                  {contributions.length === 0 && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.exploreButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        router.replace(
                          "/opportunities"
                        )
                      }
                    >
                      <Text
                        style={styles.exploreButtonText}
                      >
                        Explore opportunities
                      </Text>
                    </Pressable>
                  )}
                </View>
              }
            />
          )}
        </View>
      </View>

      <VolunteerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  main: {
    flex: 1,
  },

  header: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EBF0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 28,
    color: "#111111",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },

  headerSpace: {
    width: 38,
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  pageTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
  },

  pageDescription: {
    marginTop: 4,
    fontSize: 12,
    color: "#707B87",
  },

  summaryCard: {
    backgroundColor: "#0958D9",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  summaryLabel: {
    color: "#DCE9FF",
    fontSize: 9,
    marginTop: 3,
  },

  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#4B8BE8",
  },

  filterList: {
    gap: 7,
    paddingVertical: 12,
  },

  filter: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#D2DCE6",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  filterActive: {
    backgroundColor: "#0958D9",
    borderColor: "#0958D9",
  },

  filterText: {
    fontSize: 10,
    color: "#5E6975",
  },

  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  list: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E7ED",
    borderRadius: 11,
    padding: 12,
    marginBottom: 9,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  titleArea: {
    flex: 1,
    marginLeft: 9,
    paddingRight: 6,
  },

  opportunityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111111",
    lineHeight: 16,
  },

  organization: {
    fontSize: 10,
    color: "#74808C",
    marginTop: 2,
  },

  verifiedBadge: {
    backgroundColor: "#E6F5E8",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  verifiedText: {
    color: "#2E7D32",
    fontSize: 8,
    fontWeight: "600",
  },

  pendingBadge: {
    backgroundColor: "#FFF5DF",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  pendingText: {
    color: "#A66A00",
    fontSize: 8,
    fontWeight: "600",
  },

  rejectedBadge: {
    backgroundColor: "#FCEAEA",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  rejectedText: {
    color: "#C62828",
    fontSize: 8,
    fontWeight: "600",
  },

  submittedBadge: {
    backgroundColor: "#EEF1F5",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  submittedText: {
    color: "#59636E",
    fontSize: 8,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 8,
    color: "#8A949F",
  },

  infoValue: {
    fontSize: 10,
    color: "#222222",
    fontWeight: "600",
    marginTop: 2,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },

  taskLabel: {
    fontSize: 9,
    color: "#7B8792",
    fontWeight: "600",
    marginRight: 5,
  },

  taskText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 13,
    color: "#66717D",
  },

  messageBoxVerified: {
    marginTop: 8,
    backgroundColor: "#F0F8F1",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  messageBoxRejected: {
    marginTop: 8,
    backgroundColor: "#FFF3F3",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  messageContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  messageTextVerified: {
    flex: 1,
    fontSize: 9,
    lineHeight: 13,
    color: "#4B7050",
  },

  messageTextRejected: {
    flex: 1,
    fontSize: 9,
    lineHeight: 13,
    color: "#8C4B4B",
  },

  linkVerified: {
    color: "#0958D9",
    fontSize: 9,
    fontWeight: "700",
  },

  linkRejected: {
    color: "#C62828",
    fontSize: 9,
    fontWeight: "700",
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 15,
    color: "#737D87",
    textAlign: "center",
    maxWidth: 300,
  },

  exploreButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#0958D9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  exploreButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.75,
  },
});