import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";

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

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  hours: string;
  category: string;
};

const PROFILE_STORAGE_KEY = "impactra_profile";
const CONTRIBUTIONS_KEY = "impactra_contributions";

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Community Health Outreach",
    organization: "Impact Health Initiative",
    location: "Enugu",
    type: "In-person",
    hours: "4 hrs",
    category: "Healthcare",
  },
  {
    id: "2",
    title: "Digital Skills for Youth",
    organization: "Future Forward Africa",
    location: "Remote",
    type: "Remote",
    hours: "6 hrs",
    category: "Technology",
  },
  {
    id: "3",
    title: "School Environmental Cleanup",
    organization: "Green Community Network",
    location: "Enugu",
    type: "In-person",
    hours: "3 hrs",
    category: "Environment",
  },
  {
    id: "4",
    title: "After-School Reading Support",
    organization: "Bright Futures Foundation",
    location: "Enugu",
    type: "In-person",
    hours: "2 hrs",
    category: "Education",
  },
  {
    id: "5",
    title: "Social Media Volunteer",
    organization: "Community Action Network",
    location: "Remote",
    type: "Remote",
    hours: "5 hrs",
    category: "Technology",
  },
];

const categories = [
  "All",
  "Education",
  "Healthcare",
  "Environment",
  "Technology",
];

export default function HomeScreen() {
  const [firstName, setFirstName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [contributions, setContributions] = useState<
    Contribution[]
  >([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [savedProfile, savedContributions] =
        await Promise.all([
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          AsyncStorage.getItem(CONTRIBUTIONS_KEY),
        ]);

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);

          setFirstName(profile.firstName || "");
        } catch {
          setFirstName("");
        }
      }

      if (savedContributions) {
        try {
          const parsed = JSON.parse(savedContributions);

          if (Array.isArray(parsed)) {
            setContributions(parsed);
          }
        } catch {
          setContributions([]);
        }
      }
    } catch (error) {
      console.log("Unable to load home data:", error);
    }
  };

  const filteredOpportunities = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return opportunities.filter((opportunity) => {
      const matchesCategory =
        selectedCategory === "All" ||
        opportunity.category === selectedCategory;

      const matchesSearch =
        !searchValue ||
        opportunity.title
          .toLowerCase()
          .includes(searchValue) ||
        opportunity.organization
          .toLowerCase()
          .includes(searchValue) ||
        opportunity.location
          .toLowerCase()
          .includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const verifiedHours = contributions
    .filter((item) => item.status === "Verified")
    .reduce(
      (total, item) => total + (Number(item.hours) || 0),
      0
    );

  const appliedOpportunities = new Set(
    contributions.map((item) => item.opportunityId)
  );

  const certificateCount = contributions.filter(
    (item) => item.status === "Verified"
  ).length;

  const displayName = firstName.trim() || "Volunteer";

  const openOpportunity = (opportunity: Opportunity) => {
    router.push({
      pathname: "/opportunity-details",
      params: {
        id: opportunity.id,
        title: opportunity.title,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back
            </Text>

            <Text style={styles.name}>
              {displayName}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push("/my-profile")
            }
            style={({ pressed }) => [
              styles.logoButton,
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={require("../../assets/images/impactra-logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* IMPACT SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Your impact
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {verifiedHours}
              </Text>

              <Text style={styles.statLabel}>
                Verified hours
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {appliedOpportunities.size}
              </Text>

              <Text style={styles.statLabel}>
                Applications
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {certificateCount}
              </Text>

              <Text style={styles.statLabel}>
                Certificates
              </Text>
            </View>
          </View>
        </View>

        {/* SEARCH */}
        <Text style={styles.sectionTitle}>
          Find an opportunity
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color="#6E7781"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search volunteer opportunities"
            placeholderTextColor="#8993A0"
            style={styles.searchInput}
          />
        </View>

        {/* CATEGORIES */}
        <View style={styles.categoryRow}>
          {categories.map((category) => {
            const active =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(category)
                }
                style={({ pressed }) => [
                  active
                    ? styles.categoryActive
                    : styles.category,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={
                    active
                      ? styles.categoryActiveText
                      : styles.categoryText
                  }
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* RECOMMENDED */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recommended for you
          </Text>

          <Pressable
            onPress={() =>
              router.push("/opportunities")
            }
            hitSlop={8}
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </Pressable>
        </View>

        {/* OPPORTUNITIES */}
        {filteredOpportunities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="search-outline"
              size={28}
              color="#0958D9"
            />

            <Text style={styles.emptyTitle}>
              No opportunities found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or category.
            </Text>
          </View>
        ) : (
          filteredOpportunities
            .slice(0, 3)
            .map((opportunity) => (
              <Pressable
                key={opportunity.id}
                style={({ pressed }) => [
                  styles.opportunityCard,
                  pressed && styles.pressed,
                ]}
                onPress={() =>
                  openOpportunity(opportunity)
                }
              >
                <View style={styles.opportunityTop}>
                  <View style={styles.iconBox}>
                    <Ionicons
                      name="briefcase-outline"
                      size={21}
                      color="#0958D9"
                    />
                  </View>

                  <View style={styles.opportunityInfo}>
                    <Text
                      style={styles.opportunityTitle}
                      numberOfLines={2}
                    >
                      {opportunity.title}
                    </Text>

                    <Text style={styles.organization}>
                      {opportunity.organization}
                    </Text>
                  </View>
                </View>

                <View style={styles.categoryTagRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>
                      {opportunity.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detail}>
                    {opportunity.location}
                  </Text>

                  <Text style={styles.dot}>•</Text>

                  <Text style={styles.detail}>
                    {opportunity.type}
                  </Text>

                  <Text style={styles.dot}>•</Text>

                  <Text style={styles.detail}>
                    {opportunity.hours}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.openText}>
                    Open opportunity
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#0958D9"
                  />
                </View>
              </Pressable>
            ))
        )}

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Your verified impact starts here
          </Text>

          <Text style={styles.infoText}>
            Join an opportunity, contribute your time,
            and build a trusted record of the work you do.
          </Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push(
                "/contribution-history"
              )
            }
          >
            <Ionicons
              name="time-outline"
              size={21}
              color="#0958D9"
            />

            <Text style={styles.quickActionText}>
              My contributions
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push("/my-profile")
            }
          >
            <Ionicons
              name="person-outline"
              size={21}
              color="#0958D9"
            />

            <Text style={styles.quickActionText}>
              My profile
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <VolunteerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  greeting: {
    fontSize: 13,
    color: "#68717D",
  },

  name: {
    marginTop: 3,
    fontSize: 25,
    fontWeight: "700",
    color: "#111111",
  },

  logoButton: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  headerLogo: {
    width: 60,
    height: 60,
  },

  summaryCard: {
    backgroundColor: "#0958D9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 27,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
  },

  statLabel: {
    color: "#DCE9FF",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  divider: {
    width: 1,
    height: 38,
    backgroundColor: "#4A8AE7",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },

  searchBox: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1DCE7",
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    fontSize: 13,
    color: "#111111",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    paddingVertical: 18,
  },

  categoryActive: {
    backgroundColor: "#0958D9",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryActiveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  category: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1DCE7",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryText: {
    color: "#555F6B",
    fontSize: 12,
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  viewAll: {
    color: "#0958D9",
    fontSize: 12,
    fontWeight: "600",
  },

  opportunityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E6EC",
    padding: 16,
    marginBottom: 13,
  },

  opportunityTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  opportunityInfo: {
    flex: 1,
    marginLeft: 12,
  },

  opportunityTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: "#111111",
  },

  organization: {
    fontSize: 12,
    color: "#6F7883",
    marginTop: 4,
  },

  categoryTagRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  categoryTag: {
    backgroundColor: "#EAF2FF",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  categoryTagText: {
    color: "#174B9C",
    fontSize: 9,
    fontWeight: "600",
  },

  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 12,
  },

  detail: {
    fontSize: 11,
    color: "#68717D",
  },

  dot: {
    marginHorizontal: 6,
    color: "#9AA3AD",
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    marginTop: 14,
    paddingTop: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  openText: {
    color: "#0958D9",
    fontSize: 12,
    fontWeight: "600",
  },

  infoCard: {
    backgroundColor: "#EEF5FF",
    borderRadius: 14,
    padding: 18,
    marginTop: 5,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#174B9C",
  },

  infoText: {
    fontSize: 12,
    color: "#5D6D81",
    lineHeight: 18,
    marginTop: 7,
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  quickAction: {
    flex: 1,
    minHeight: 74,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6EC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  quickActionText: {
    marginTop: 6,
    fontSize: 10,
    color: "#4F5A66",
    fontWeight: "600",
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6EC",
    borderRadius: 14,
    padding: 30,
    alignItems: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 11,
    color: "#707A86",
    marginTop: 5,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
  },
});