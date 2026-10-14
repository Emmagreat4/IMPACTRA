import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
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

const categories = [
  "All",
  "Food Relief",
  "Community",
  "Health",
  "Education",
  "Environment",
  "Technology",
];

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  date: string;
  type: string;
  hours: string;
  imageUrl?: string;
  startTime?: string;
  availableSpots?: number;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  capacity?: string;
  available?: string;
};

/*
 * Keep this empty until the genuine published-opportunities
 * service is connected. Never insert fictional listings here.
 */
const opportunities: Opportunity[] = [];

export default function OpportunitiesScreen() {
  const params = useLocalSearchParams<{
    search?: string | string[];
  }>();

  const initialSearch = Array.isArray(params.search)
    ? params.search[0] ?? ""
    : params.search ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return opportunities.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.organization.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category.trim().toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const filtersAreActive =
    search.trim().length > 0 || selectedCategory !== "All";

  const openOpportunity = (item: Opportunity) => {
    router.push({
      pathname: "/opportunity-details",
      params: {
        id: item.id,
        title: item.title,
        organization: item.organization,
        category: item.category,
        location: item.location,
        date: item.date,
        type: item.type,
        hours: item.hours,
        imageUrl: item.imageUrl ?? "",
        startTime: item.startTime ?? "",
        availableSpots:
          item.availableSpots === undefined
            ? ""
            : String(item.availableSpots),
        description: item.description ?? "",
        responsibilities: item.responsibilities ?? "",
        requirements: item.requirements ?? "",
        capacity: item.capacity ?? "",
        available: item.available ?? "",
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  const renderOpportunity = ({
    item,
  }: {
    item: Opportunity;
  }) => (
    <View style={styles.opportunityCard}>
      {item.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.opportunityImage}
            resizeMode="cover"
            accessibilityLabel={`Photo for ${item.title}`}
          />

          <View style={styles.imageBadges}>
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>
                {item.category}
              </Text>
            </View>

            {item.hours ? (
              <View style={styles.imageBadge}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={DARK_BLUE}
                />
                <Text style={styles.imageBadgeText}>
                  {item.hours}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.cardDetails}>
        <View style={styles.metadataRow}>
          <Text style={styles.categoryLabel}>
            {item.category.toUpperCase()}
          </Text>

          <View style={styles.metadataDot} />

          <Ionicons
            name="location-outline"
            size={13}
            color={MUTED}
          />

          <Text style={styles.locationText}>
            {item.location}
          </Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>

        <Text style={styles.organization}>
          {item.organization}
        </Text>

        {item.date || item.startTime ? (
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={BLUE}
            />
            <Text style={styles.dateText}>
              {[item.date, item.startTime]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        ) : null}

        {typeof item.availableSpots === "number" ? (
          <View style={styles.spotsRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={BLUE}
            />
            <Text style={styles.spotsText}>
              {item.availableSpots} available places
            </Text>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.viewButton,
            pressed && styles.pressed,
          ]}
          onPress={() => openOpportunity(item)}
          accessibilityRole="button"
          accessibilityLabel={`View ${item.title}`}
        >
          <Text style={styles.viewButtonText}>
            View Opportunity
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={WHITE}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
      />

      <View style={styles.screen}>
        {/* Discover header */}
        <View style={styles.header}>
          <Pressable
            style={styles.headerIcon}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={TEXT}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Discover</Text>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerAction}
              onPress={() => router.push("/saved-opportunities")}
              accessibilityRole="button"
              accessibilityLabel="Open saved opportunities"
            >
              <Ionicons
                name="bookmark-outline"
                size={21}
                color={BLUE}
              />
            </Pressable>

            <Pressable
              style={styles.headerAction}
              onPress={() => router.push("/application-status")}
              accessibilityRole="button"
              accessibilityLabel="Check application status"
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color={TEXT}
              />
            </Pressable>

            <Pressable
              style={styles.avatar}
              onPress={() => router.push("/profile")}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
            >
              <Ionicons
                name="person-outline"
                size={21}
                color={BLUE}
              />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={19}
            color={BLUE}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search causes, tasks, or places..."
            placeholderTextColor="#98A3B3"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search published opportunities"
          />

          {search.length > 0 ? (
            <Pressable
              onPress={() => setSearch("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={MUTED}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Category filters */}
        <View style={styles.categoryArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Opportunity results */}
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={filteredOpportunities}
          keyExtractor={(item) => item.id}
          renderItem={renderOpportunity}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                DISCOVER OPPORTUNITIES
              </Text>

              <Text style={styles.sectionSubtitle}>
                Browse published opportunities from participating
                organizations.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={
                    filtersAreActive
                      ? "search-outline"
                      : "compass-outline"
                  }
                  size={29}
                  color={BLUE}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {filtersAreActive
                  ? "No matching opportunities"
                  : "Published opportunities are not connected yet"}
              </Text>

              <Text style={styles.emptyDescription}>
                {filtersAreActive
                  ? "No published records match the current search and category. Try adjusting your search or clearing the filters."
                  : "This screen is ready to display genuine opportunities. No published-opportunities endpoint has been confirmed in the available backend reference, so no sample listings are shown."}
              </Text>

              {filtersAreActive ? (
                <Pressable
                  onPress={clearFilters}
                  style={({ pressed }) => [
                    styles.resetButton,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.resetButtonText}>
                    Clear search and filters
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={BLUE}
              />
              <Text style={styles.footerNoteText}>
                Only genuine published opportunities should appear here.
              </Text>
            </View>
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
    backgroundColor: WHITE,
  },

  screen: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: BACKGROUND,
  },

  header: {
    minHeight: 60,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    gap: 10,
  },

  headerIcon: {
    width: 32,
    height: 40,
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 20,
    fontWeight: "800",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  headerAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    borderRadius: 18,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALE_BLUE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE8FF",
  },

  searchContainer: {
    minHeight: 47,
    marginHorizontal: 17,
    marginTop: 7,
    marginBottom: 7,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  searchInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    color: TEXT,
    fontSize: 12,
  },

  categoryArea: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  categoryList: {
    paddingHorizontal: 17,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F7F9FC",
  },

  categoryChipActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  categoryChipText: {
    color: "#59677A",
    fontSize: 11,
    fontWeight: "600",
  },

  categoryChipTextActive: {
    color: WHITE,
    fontWeight: "800",
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 17,
    paddingBottom: 16,
    flexGrow: 1,
  },

  sectionHeading: {
    paddingTop: 18,
    paddingBottom: 13,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: TEXT,
  },

  sectionSubtitle: {
    marginTop: 5,
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
  },

  opportunityCard: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 15,
  },

  imageContainer: {
    height: 170,
    width: "100%",
    position: "relative",
    backgroundColor: PALE_BLUE,
  },

  opportunityImage: {
    height: "100%",
    width: "100%",
  },

  imageBadges: {
    position: "absolute",
    left: 10,
    top: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  imageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: WHITE,
  },

  imageBadgeText: {
    color: DARK_BLUE,
    fontSize: 10,
    fontWeight: "800",
  },

  cardDetails: {
    padding: 13,
  },

  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 7,
  },

  categoryLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: BLUE,
  },

  metadataDot: {
    height: 3,
    width: 3,
    borderRadius: 2,
    backgroundColor: "#A6B0BF",
  },

  locationText: {
    fontSize: 10,
    color: MUTED,
    flexShrink: 1,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    color: TEXT,
  },

  organization: {
    marginTop: 4,
    color: MUTED,
    fontSize: 11,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 11,
  },

  dateText: {
    fontSize: 10,
    color: "#596A80",
    flexShrink: 1,
  },

  spotsRow: {
    marginTop: 10,
    backgroundColor: PALE_BLUE,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  spotsText: {
    color: DARK_BLUE,
    fontSize: 11,
    fontWeight: "700",
  },

  viewButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: BLUE,
    borderRadius: 10,
    marginTop: 13,
  },

  viewButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },

  emptyState: {
    paddingHorizontal: 16,
    paddingVertical: 22,
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 15,
  },

  emptyIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: PALE_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 7,
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 350,
  },

  resetButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C9D9F7",
    marginTop: 14,
  },

  resetButtonText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "800",
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 3,
    paddingVertical: 10,
  },

  footerNoteText: {
    flex: 1,
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
  },
});