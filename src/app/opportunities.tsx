import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  date: string;
  type: string;
  hours: string;
};

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Community Health Outreach",
    organization: "Impact Health Initiative",
    category: "Healthcare",
    location: "Enugu",
    date: "Oct 10, 2026",
    type: "In-person",
    hours: "4 hrs",
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
  },
];

const categories = [
  "All",
  "Education",
  "Healthcare",
  "Environment",
  "Technology",
];

export default function OpportunitiesScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.title.toLowerCase().includes(searchValue) ||
        item.organization.toLowerCase().includes(searchValue) ||
        item.location.toLowerCase().includes(searchValue);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const renderOpportunity = ({
    item,
  }: {
    item: Opportunity;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={() =>
        router.push({
          pathname: "/opportunity-details",
          params: {
            id: item.id,
            title: item.title,
          },
        })
      }
    >
      <View style={styles.cardTop}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>
            {item.category.charAt(0)}
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <Text style={styles.organization}>
            {item.organization}
          </Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          Location: {item.location}
        </Text>

        <Text style={styles.detailText}>
          Date: {item.date}
        </Text>

        <Text style={styles.detailText}>
          Hours: {item.hours}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewText}>
          View opportunity
        </Text>

        <Text style={styles.arrow}>›</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.main}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Opportunities
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.content}>
          <Text style={styles.introTitle}>
            Find an opportunity
          </Text>

          <Text style={styles.introText}>
            Discover volunteer opportunities that match your
            interests and skills.
          </Text>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search opportunities"
              placeholderTextColor="#8993A0"
              style={styles.searchInput}
            />
          </View>

          {/* CATEGORY FILTERS */}
          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const selected = selectedCategory === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedCategory(item)}
                  style={[
                    styles.filterButton,
                    selected && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              Available opportunities
            </Text>

            <Text style={styles.resultCount}>
              {filteredOpportunities.length}
            </Text>
          </View>

          <FlatList
            data={filteredOpportunities}
            keyExtractor={(item) => item.id}
            renderItem={renderOpportunity}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  No opportunities found
                </Text>

                <Text style={styles.emptyText}>
                  Try a different search or category.
                </Text>
              </View>
            }
          />
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
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 31,
    color: "#111111",
    fontWeight: "300",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },

  headerSpace: {
    width: 40,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
  },

  introText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6A7480",
    lineHeight: 19,
    maxWidth: 340,
  },

  searchBox: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1DCE7",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 18,
  },

  searchIcon: {
    fontSize: 22,
    color: "#6D7680",
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    color: "#111111",
  },

  /* NEW RESPONSIVE CATEGORY GRID */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    paddingVertical: 16,
  },

  filterButton: {
    minWidth: 74,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1DCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#0958D9",
    borderColor: "#0958D9",
  },

  filterText: {
    fontSize: 12,
    color: "#59636E",
    textAlign: "center",
  },

  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  resultCount: {
    fontSize: 12,
    color: "#6D7680",
  },

  list: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E6EC",
    padding: 16,
    marginBottom: 13,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryIconText: {
    color: "#0958D9",
    fontSize: 19,
    fontWeight: "700",
  },

  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    lineHeight: 19,
  },

  organization: {
    marginTop: 4,
    fontSize: 12,
    color: "#707A86",
  },

  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  tag: {
    backgroundColor: "#F1F5F9",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  tagText: {
    fontSize: 10,
    color: "#56616D",
  },

  details: {
    marginTop: 12,
    gap: 5,
  },

  detailText: {
    fontSize: 11,
    color: "#6D7782",
  },

  footer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEF1F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewText: {
    fontSize: 12,
    color: "#0958D9",
    fontWeight: "600",
  },

  arrow: {
    fontSize: 22,
    color: "#0958D9",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingHorizontal: 25,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 12,
    color: "#6D7782",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
  },
});