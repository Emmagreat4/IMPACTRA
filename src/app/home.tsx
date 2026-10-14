import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import VolunteerBottomNav from "../components/volunteer-bottom-nav";

const BLUE = "#155EEF";
const DARK_BLUE = "#123B70";
const BACKGROUND = "#F7F9FD";
const PALE_BLUE = "#EFF5FF";
const BORDER = "#E5EBF4";
const TEXT = "#172B4D";
const MUTED = "#7B8798";
const WHITE = "#FFFFFF";

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  const openOpportunities = () => {
    const term = search.trim();

    router.push({
      pathname: "/opportunities",
      params: term ? { search: term } : {},
    });
  };

  const openProfile = () => {
    router.push("/profile");
  };

  const openApplicationStatus = () => {
    router.push("/application-status");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BACKGROUND}
      />

      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome header */}
          <View style={styles.header}>
            <Pressable
              style={styles.avatar}
              onPress={openProfile}
              accessibilityRole="button"
              accessibilityLabel="Open volunteer profile"
            >
              <Ionicons
                name="person-outline"
                size={22}
                color={BLUE}
              />
            </Pressable>

            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>
                Welcome back
              </Text>

              <Text style={styles.greetingSubtitle}>
                Ready to make an impact?
              </Text>
            </View>

            <Pressable
              style={styles.notificationButton}
              onPress={openApplicationStatus}
              accessibilityRole="button"
              accessibilityLabel="Check application status"
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={TEXT}
              />
            </Pressable>
          </View>

          {/* Opportunity search */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={21}
              color={BLUE}
            />

            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search opportunities and causes"
              placeholderTextColor="#96A2B3"
              returnKeyType="search"
              onSubmitEditing={openOpportunities}
              accessibilityLabel="Search volunteer opportunities"
            />

            <Pressable
              onPress={openOpportunities}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Search opportunities"
            >
              <Ionicons
                name="arrow-forward-circle"
                size={25}
                color={BLUE}
              />
            </Pressable>
          </View>

          {/* Impact summary */}
          <View style={styles.sectionHeading}>
            <View style={styles.headingText}>
              <Text style={styles.sectionTitle}>
                Your Impact
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your verified contributions at a glance.
              </Text>
            </View>
          </View>

          <View style={styles.impactCard}>
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={BLUE}
              />

              <Text style={styles.statValue}>—</Text>

              <Text style={styles.statLabel}>
                Verified Hours
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={BLUE}
              />

              <Text style={styles.statValue}>—</Text>

              <Text style={styles.statLabel}>
                Completed Activities
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={20}
                color={BLUE}
              />

              <Text style={styles.statValue}>—</Text>

              <Text style={styles.statLabel}>
                People Reached
              </Text>
            </View>
          </View>

          <View style={styles.dataNote}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={MUTED}
            />

            <Text style={styles.dataNoteText}>
              Verified totals will appear when the relevant
              account records are available.
            </Text>
          </View>

          {/* Recommended opportunities */}
          <View style={styles.sectionHeading}>
            <View style={styles.headingText}>
              <Text style={styles.sectionTitle}>
                Recommended Opportunities
              </Text>

              <Text style={styles.sectionSubtitle}>
                Find a cause that matters to you.
              </Text>
            </View>

            <Pressable
              onPress={openOpportunities}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Browse all opportunities"
              style={styles.sectionAction}
            >
              <Text style={styles.sectionActionText}>
                View all
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={BLUE}
              />
            </Pressable>
          </View>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="compass-outline"
                size={23}
                color={BLUE}
              />
            </View>

            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>
                No published opportunities yet
              </Text>

              <Text style={styles.emptyDescription}>
                Genuine opportunities will appear here when
                they are available from the connected service.
              </Text>

              <Pressable
                onPress={openOpportunities}
                style={({ pressed }) => [
                  styles.textAction,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.textActionLabel}>
                  Browse opportunities
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={BLUE}
                />
              </Pressable>
            </View>
          </View>

          {/* Upcoming activities */}
          <View style={styles.sectionHeading}>
            <View style={styles.headingText}>
              <Text style={styles.sectionTitle}>
                Upcoming Activities
              </Text>

              <Text style={styles.sectionSubtitle}>
                Keep track of your volunteering commitments.
              </Text>
            </View>
          </View>

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={23}
                color={BLUE}
              />
            </View>

            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>
                No upcoming activities to display
              </Text>

              <Text style={styles.emptyDescription}>
                Your scheduled commitments will appear here
                when genuine application and activity records
                are available.
              </Text>

              <Pressable
                onPress={openApplicationStatus}
                style={({ pressed }) => [
                  styles.textAction,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.textActionLabel}>
                  Check application status
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={BLUE}
                />
              </Pressable>
            </View>
          </View>

          {/* Genuine data reminder */}
          <View style={styles.connectionNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={BLUE}
            />

            <Text style={styles.connectionText}>
              IMPACTRA displays real volunteer records.
              Contributions count toward verified impact only
              after genuine review and verification.
            </Text>
          </View>

          <Text style={styles.footerText}>
            IMPACTRA
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <VolunteerBottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  screen: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: BACKGROUND,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },

  // Welcome header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 20,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PALE_BLUE,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    justifyContent: "center",
    alignItems: "center",
  },

  greetingBlock: {
    flex: 1,
  },

  greeting: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
  },

  greetingSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 3,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchBox: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 13,
    marginBottom: 23,
  },

  searchInput: {
    flex: 1,
    height: 46,
    color: TEXT,
    fontSize: 12,
    paddingVertical: 0,
    outlineStyle: "none",
  } as any,

  // Section headings
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
    marginTop: 3,
  },

  headingText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },

  sectionSubtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingLeft: 5,
  },

  sectionActionText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "700",
  },

  // Impact summary
  impactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALE_BLUE,
    borderWidth: 1,
    borderColor: "#DFE9FC",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 3,
  },

  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  statValue: {
    color: DARK_BLUE,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
    marginTop: 4,
  },

  statLabel: {
    color: "#627590",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 49,
    backgroundColor: "#D7E4FC",
  },

  dataNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 7,
    marginBottom: 19,
  },

  dataNoteText: {
    flex: 1,
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
  },

  // Compact honest empty states
  emptyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 13,
    marginBottom: 19,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 13,
    backgroundColor: PALE_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },

  emptyDescription: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  textAction: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: 9,
    paddingVertical: 3,
  },

  textActionLabel: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
  },

  // Data integrity note
  connectionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 11,
    borderRadius: 12,
    backgroundColor: PALE_BLUE,
    borderWidth: 1,
    borderColor: "#DFE9FC",
    marginBottom: 16,
  },

  connectionText: {
    flex: 1,
    color: "#627590",
    fontSize: 10,
    lineHeight: 16,
  },

  footerText: {
    color: "#8592A4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 2,
  },

  bottomSpace: {
    height: 12,
  },
});