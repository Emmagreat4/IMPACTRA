
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";

type Status =
  | "Submitted"
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Saved locally";

type StoredContribution = {
  id?: string;
  opportunityId?: string;
  opportunityTitle?: string;
  title?: string;
  organization?: string;
  date?: string;
  hours?: number | string;
  task?: string;
  evidence?: string;
  status?: string;
  submittedAt?: string;
  rejectionReason?: string;

  // Set these only for statuses received from a real service.
  serverConfirmed?: boolean;
  statusSource?: string;
};

type Contribution = {
  id: string;
  opportunityId: string;
  opportunity: string;
  organization: string;
  date: string;
  numericHours: number | null;
  task: string;
  status: Status;
  submittedAt: string;
  rejectionReason: string;
};

const CONTRIBUTIONS_KEY = "impactra_contributions";

const COLORS = {
  blue: "#155EEF",
  darkBlue: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EFF5FF",
  border: "#E5EBF4",
  text: "#172B4D",
  muted: "#7B8798",
  green: "#287443",
  paleGreen: "#EAF6EE",
  red: "#B42318",
  paleRed: "#FFF0EF",
  gray: "#59677A",
  paleGray: "#EDF1F6",
};

const FILTERS: Status[] = [
  "Saved locally",
  "Submitted",
  "Pending",
  "Verified",
  "Rejected",
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(record: StoredContribution): Status {
  // A status saved only on this device is not proof of an
  // organization's submission, review, or verification decision.
  const confirmed =
    record.serverConfirmed === true ||
    record.statusSource === "server";

  if (!confirmed) {
    return "Saved locally";
  }

  const value = stringValue(record.status).toLowerCase();

  switch (value) {
    case "submitted":
      return "Submitted";
    case "pending":
      return "Pending";
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return "Saved locally";
  }
}

function parseContributions(raw: string | null): Contribution[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved contribution data is invalid.");
  }

  const converted: Contribution[] = [];

  for (const value of parsed) {
    if (!isObject(value)) continue;

    const record = value as StoredContribution;

    if (typeof record.id !== "string" || !record.id.trim()) {
      continue;
    }

    const rawHours = record.hours;
    const parsedHours =
      rawHours !== undefined &&
      rawHours !== null &&
      !(typeof rawHours === "string" && !rawHours.trim())
        ? Number(rawHours)
        : Number.NaN;

    const numericHours =
      Number.isFinite(parsedHours) && parsedHours >= 0
        ? parsedHours
        : null;

    converted.push({
      id: record.id,
      opportunityId: stringValue(record.opportunityId),
      opportunity:
        stringValue(record.opportunityTitle) ||
        stringValue(record.title) ||
        "Contribution record",
      organization: stringValue(record.organization),
      date: stringValue(record.date),
      numericHours,
      task: stringValue(record.task),
      status: normalizeStatus(record),
      submittedAt: stringValue(record.submittedAt),
      rejectionReason: stringValue(record.rejectionReason),
    });
  }

  converted.sort((a, b) => {
    const aTime = Date.parse(a.submittedAt);
    const bTime = Date.parse(b.submittedAt);

    if (Number.isFinite(aTime) && Number.isFinite(bTime)) {
      return bTime - aTime;
    }

    if (Number.isFinite(aTime)) return -1;
    if (Number.isFinite(bTime)) return 1;

    return 0;
  });

  return converted;
}

function formatDate(value: string): string {
  if (!value) return "Not recorded";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    // Preserve a date string that is not understood by Date.
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHours(value: number | null): string {
  if (value === null) return "Not recorded";

  return `${value} ${value === 1 ? "hour" : "hours"}`;
}

function statusStyles(status: Status) {
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

    case "Submitted":
      return {
        badge: styles.submittedBadge,
        text: styles.submittedText,
      };

    default:
      return {
        badge: styles.localBadge,
        text: styles.localText,
      };
  }
}

export default function ContributionHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadContributions = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const raw = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
      const records = parseContributions(raw);
      setContributions(records);
    } catch (error) {
      console.error("Unable to load contribution history:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadContributions();
    }, [loadContributions])
  );

  const filteredContributions = useMemo(() => {
    if (selectedFilter === "All") return contributions;

    return contributions.filter(
      (item) => item.status === selectedFilter
    );
  }, [contributions, selectedFilter]);

  // Only statuses explicitly confirmed by a real service can
  // contribute to official verification totals.
  const verifiedContributions = useMemo(
    () => contributions.filter((item) => item.status === "Verified"),
    [contributions]
  );

  const verifiedHours = useMemo(
    () =>
      verifiedContributions.reduce(
        (total, item) => total + (item.numericHours ?? 0),
        0
      ),
    [verifiedContributions]
  );

  const verifiedOrganizations = useMemo(
    () =>
      new Set(
        verifiedContributions
          .map((item) => item.organization)
          .filter(Boolean)
      ).size,
    [verifiedContributions]
  );

  const startCorrection = (item: Contribution) => {
    if (!item.opportunityId) {
      router.push("/log-hours");
      return;
    }

    router.push({
      pathname: "/log-hours",
      params: {
        opportunityId: item.opportunityId,
        opportunityTitle: item.opportunity,
        organization: item.organization,
        correctionOf: item.id,
      },
    });
  };

  const renderContribution = ({ item }: { item: Contribution }) => {
    const badge = statusStyles(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.titleArea}>
            <Text style={styles.opportunityTitle}>
              {item.opportunity}
            </Text>

            {item.organization ? (
              <Text style={styles.organization}>
                {item.organization}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={badge.badge}>
            <Text style={badge.text}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Activity date</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.date)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Hours recorded</Text>
            <Text style={styles.infoValue}>
              {formatHours(item.numericHours)}
            </Text>
          </View>
        </View>

        {item.task ? (
          <View style={styles.taskRow}>
            <Text style={styles.taskLabel}>Task</Text>
            <Text style={styles.taskText}>{item.task}</Text>
          </View>
        ) : null}

        {item.status === "Saved locally" ? (
          <View style={styles.localNotice}>
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={COLORS.darkBlue}
            />
            <Text style={styles.localNoticeText}>
              This record is saved on this device. It has not been
              confirmed as submitted to or reviewed by an organization.
            </Text>
          </View>
        ) : null}

        {item.status === "Submitted" ? (
          <View style={styles.infoNotice}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={COLORS.blue}
            />
            <Text style={styles.infoNoticeText}>
              The connected service recorded this submission. A review
              decision has not been recorded here.
            </Text>
          </View>
        ) : null}

        {item.status === "Pending" ? (
          <View style={styles.infoNotice}>
            <Ionicons
              name="time-outline"
              size={18}
              color={COLORS.darkBlue}
            />
            <Text style={styles.infoNoticeText}>
              The connected service reports that this contribution is
              awaiting review.
            </Text>
          </View>
        ) : null}

        {item.status === "Verified" ? (
          <View style={styles.verifiedNotice}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={COLORS.green}
            />
            <View style={styles.messageContent}>
              <Text style={styles.verifiedNoticeText}>
                Verification is recorded by the connected service.
              </Text>

              <Pressable
                onPress={() => router.push("/certificate")}
                accessibilityRole="button"
              >
                <Text style={styles.verifiedLink}>
                  View certificates
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {item.status === "Rejected" ? (
          <View style={styles.rejectedNotice}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.red}
            />
            <View style={styles.messageContent}>
              <Text style={styles.rejectedNoticeText}>
                The connected service reports that this contribution
                was rejected.
              </Text>

              {item.rejectionReason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonLabel}>
                    Reason provided
                  </Text>
                  <Text style={styles.rejectedNoticeText}>
                    {item.rejectionReason}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => startCorrection(item)}
                accessibilityRole="button"
              >
                <Text style={styles.rejectedLink}>
                  Start correction
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  const emptyState = loading ? (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={COLORS.blue} />
      <Text style={styles.stateDescription}>
        Loading contribution records...
      </Text>
    </View>
  ) : loadError ? (
    <View style={styles.stateContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="alert-circle-outline"
          size={29}
          color={COLORS.blue}
        />
      </View>
      <Text style={styles.emptyTitle}>Unable to load records</Text>
      <Text style={styles.emptyText}>
        Your saved contribution history could not be read.
        Try loading it again.
      </Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => void loadContributions()}
        accessibilityRole="button"
      >
        <Ionicons name="refresh-outline" size={17} color={COLORS.white} />
        <Text style={styles.primaryButtonText}>Try again</Text>
      </Pressable>
    </View>
  ) : (
    <View style={styles.stateContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="document-text-outline"
          size={29}
          color={COLORS.blue}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {contributions.length === 0
          ? "No contribution records yet"
          : "No matching contributions"}
      </Text>

      <Text style={styles.emptyText}>
        {contributions.length === 0
          ? "When you save a contribution in IMPACTRA, its local record will appear here. Official submission and verification require a connected service."
          : "There are no records under this filter. Choose another status to review your contribution history."}
      </Text>

      {contributions.length === 0 ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/opportunities")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            Explore opportunities
          </Text>
          <Ionicons
            name="arrow-forward"
            size={17}
            color={COLORS.white}
          />
        </Pressable>
      ) : null}
    </View>
  );

  const listHeader = (
    <View>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Contribution history</Text>
        <Text style={styles.pageDescription}>
          Review your saved volunteer records and any confirmed review
          decisions.
        </Text>
      </View>

      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={COLORS.blue}
        />
        <Text style={styles.noticeText}>
          Records saved on this device are not automatically sent to an
          organization. Only decisions confirmed by a connected service
          count as official statuses.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {verifiedHours}
          </Text>
          <Text style={styles.summaryLabel}>
            Server-verified hours
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {verifiedOrganizations}
          </Text>
          <Text style={styles.summaryLabel}>
            Verified organizations
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {verifiedContributions.length}
          </Text>
          <Text style={styles.summaryLabel}>
            Verified records
          </Text>
        </View>
      </View>

      <Text style={styles.filterHeading}>Filter by status</Text>

      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => setSelectedFilter("All")}
          style={[
            styles.filter,
            selectedFilter === "All" && styles.filterActive,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedFilter === "All" }}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "All" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>

        {FILTERS.map((filter) => {
          const selected = selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filter,
                selected && styles.filterActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.listHeading}>
        {selectedFilter === "All"
          ? "Your records"
          : `${selectedFilter} records`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
            accessibilityLabel="Return to Home"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Contribution history</Text>

          <Pressable
            style={styles.headerButton}
            onPress={() => void loadContributions()}
            accessibilityRole="button"
            accessibilityLabel="Refresh records"
            disabled={loading}
            hitSlop={8}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={COLORS.blue}
            />
          </Pressable>
        </View>

        <FlatList
          style={styles.list}
          data={
            loading || loadError
              ? []
              : filteredContributions
          }
          keyExtractor={(item) => item.id}
          renderItem={renderContribution}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void loadContributions()}
              tintColor={COLORS.blue}
              colors={[COLORS.blue]}
            />
          }
        />

        <VolunteerBottomNav />
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
    minHeight: 60,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    paddingHorizontal: 6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 18,
    flexGrow: 1,
  },
  pageIntro: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  pageDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    marginTop: 5,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 11,
    padding: 11,
  },
  noticeText: {
    flex: 1,
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.blue,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 5,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  summaryNumber: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  summaryLabel: {
    color: "#E5EEFF",
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#8DB3FF",
  },
  filterHeading: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 9,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  filter: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  filterActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  filterText: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: "800",
  },
  listHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 21,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  opportunityTitle: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  organization: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: COLORS.paleGreen,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  verifiedText: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: "800",
  },
  pendingBadge: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pendingText: {
    color: COLORS.darkBlue,
    fontSize: 9,
    fontWeight: "800",
  },
  rejectedBadge: {
    backgroundColor: COLORS.paleRed,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  rejectedText: {
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "800",
  },
  submittedBadge: {
    backgroundColor: COLORS.paleGray,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  submittedText: {
    color: COLORS.gray,
    fontSize: 9,
    fontWeight: "800",
  },
  localBadge: {
    backgroundColor: "#F1F3F7",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  localText: {
    color: "#536174",
    fontSize: 9,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F6",
  },
  infoItem: {
    flex: 1,
    minWidth: 0,
    paddingRight: 5,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },
  infoValue: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 10,
  },
  taskLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#65758B",
  },
  taskText: {
    flex: 1,
    color: COLORS.gray,
    fontSize: 10,
    lineHeight: 16,
  },
  localNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 9,
    padding: 10,
    marginTop: 11,
  },
  localNoticeText: {
    flex: 1,
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 16,
  },
  infoNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F2F6FF",
    borderRadius: 9,
    padding: 10,
    marginTop: 11,
  },
  infoNoticeText: {
    flex: 1,
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 16,
  },
  verifiedNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.paleGreen,
    borderRadius: 9,
    padding: 10,
    marginTop: 11,
  },
  verifiedNoticeText: {
    color: COLORS.green,
    fontSize: 10,
    lineHeight: 16,
  },
  rejectedNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.paleRed,
    borderRadius: 9,
    padding: 10,
    marginTop: 11,
  },
  rejectedNoticeText: {
    color: "#874343",
    fontSize: 10,
    lineHeight: 16,
  },
  messageContent: {
    flex: 1,
    gap: 8,
  },
  reasonBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#E4A4A0",
    paddingLeft: 8,
    gap: 4,
  },
  reasonLabel: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
  },
  verifiedLink: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "800",
  },
  rejectedLink: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
  },
  stateContainer: {
    flexGrow: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 24,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 7,
  },
  stateDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 12,
  },
  primaryButton: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: COLORS.blue,
    marginTop: 17,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
});
