import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import VolunteerBottomNav from "../components/volunteer-bottom-nav";

const STORAGE_KEY = "impactra_saved_opportunities";

const COLORS = {
  blue: "#155EEF",
  darkBlue: "#123B70",
  background: "#F7F9FD",
  paleBlue: "#EFF5FF",
  border: "#E5EBF4",
  text: "#172B4D",
  muted: "#7B8798",
  white: "#FFFFFF",
  danger: "#C62828",
};

type SavedOpportunity = {
  id: string;
  title: string;
  organization?: string;
  category?: string;
  location?: string;
  date?: string;
  type?: string;
  hours?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  capacity?: string;
  available?: string;
  imageUrl?: string;
  startTime?: string;
  availableSpots?: string;
  savedAt?: string;
};

function parseSavedOpportunities(
  raw: string | null,
): SavedOpportunity[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved opportunity data is invalid.");
  }

  return parsed.filter(
    (item): item is SavedOpportunity => {
      if (!item || typeof item !== "object") return false;

      const candidate = item as Record<string, unknown>;

      return (
        typeof candidate.id === "string" &&
        typeof candidate.title === "string"
      );
    },
  );
}

function formatSavedDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `Saved ${date.toLocaleDateString()}`;
}

export default function SavedOpportunitiesScreen() {
  const [items, setItems] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSavedOpportunities = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = parseSavedOpportunities(raw);

      setItems(saved);
    } catch (err) {
      console.error("Unable to load saved opportunities:", err);
      setError(
        "Your saved list could not be loaded. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        setError("");

        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          const saved = parseSavedOpportunities(raw);

          if (active) setItems(saved);
        } catch (err) {
          console.error(
            "Unable to load saved opportunities:",
            err,
          );

          if (active) {
            setError(
              "Your saved list could not be loaded. Please try again.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      void load();

      return () => {
        active = false;
      };
    }, []),
  );

  const openOpportunity = (item: SavedOpportunity) => {
    router.push({
      pathname: "/opportunity-details",
      params: {
        id: item.id,
        title: item.title,
        organization: item.organization ?? "",
        category: item.category ?? "",
        location: item.location ?? "",
        date: item.date ?? "",
        type: item.type ?? "",
        hours: item.hours ?? "",
        description: item.description ?? "",
        responsibilities: item.responsibilities ?? "",
        requirements: item.requirements ?? "",
        capacity: item.capacity ?? "",
        available: item.available ?? "",
        imageUrl: item.imageUrl ?? "",
        startTime: item.startTime ?? "",
        availableSpots: item.availableSpots ?? "",
      },
    });
  };

  const removeOpportunity = (item: SavedOpportunity) => {
    Alert.alert(
      "Remove saved opportunity?",
      `Remove "${item.title}" from your saved list? This does not cancel or change an application.`,
      [
        {
          text: "Keep saved",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const raw = await AsyncStorage.getItem(STORAGE_KEY);
              const current = parseSavedOpportunities(raw);

              const updated = current.filter(
                (saved) => saved.id !== item.id,
              );

              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updated),
              );

              setItems(updated);
              setError("");
            } catch (err) {
              console.error(
                "Unable to remove saved opportunity:",
                err,
              );

              Alert.alert(
                "Unable to remove",
                "The saved list could not be updated. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: SavedOpportunity }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
          accessibilityLabel={`Photo for ${item.title}`}
        />
      ) : null}

      <View style={styles.cardContent}>
        {item.category ? (
          <Text style={styles.category}>
            {item.category.toUpperCase()}
          </Text>
        ) : null}

        <Text style={styles.cardTitle}>{item.title}</Text>

        {item.organization ? (
          <Text style={styles.organization}>
            {item.organization}
          </Text>
        ) : null}

        {item.location ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color={COLORS.muted}
            />
            <Text style={styles.detailText}>
              {item.location}
            </Text>
          </View>
        ) : null}

        {item.date || item.startTime ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={COLORS.blue}
            />
            <Text style={styles.detailText}>
              {[item.date, item.startTime]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        ) : null}

        {item.hours ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="time-outline"
              size={15}
              color={COLORS.blue}
            />
            <Text style={styles.detailText}>
              {item.hours}
            </Text>
          </View>
        ) : null}

        {formatSavedDate(item.savedAt) ? (
          <Text style={styles.savedDate}>
            {formatSavedDate(item.savedAt)}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => openOpportunity(item)}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.title}`}
          >
            <Text style={styles.primaryButtonText}>
              View details
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.white}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.removeButton,
              pressed && styles.pressed,
            ]}
            onPress={() => removeOpportunity(item)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from saved opportunities`}
          >
            <Ionicons
              name="bookmark"
              size={17}
              color={COLORS.danger}
            />
          </Pressable>
        </View>
      </View>
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
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/opportunities");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Saved Opportunities
            </Text>
            <Text style={styles.headerSubtitle}>
              Listings you saved on this device
            </Text>
          </View>

          <View style={styles.bookmarkIcon}>
            <Ionicons
              name="bookmark-outline"
              size={22}
              color={COLORS.blue}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator
              size="large"
              color={COLORS.blue}
            />
            <Text style={styles.stateText}>
              Loading saved opportunities...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={COLORS.danger}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Unable to load saved list
            </Text>

            <Text style={styles.emptyDescription}>{error}</Text>

            <Pressable
              style={styles.primaryButton}
              onPress={loadSavedOpportunities}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              items.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              items.length > 0 ? (
                <View style={styles.listHeading}>
                  <Text style={styles.countText}>
                    {items.length} saved{" "}
                    {items.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </Text>

                  <Text style={styles.listDescription}>
                    Revisit a saved listing whenever you need it.
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="bookmark-outline"
                    size={31}
                    color={COLORS.blue}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No saved opportunities yet
                </Text>

                <Text style={styles.emptyDescription}>
                  Opportunities you save from a genuine listing
                  will appear here. Nothing has been added
                  automatically.
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => router.push("/opportunities")}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="compass-outline"
                    size={17}
                    color={COLORS.white}
                  />
                  <Text style={styles.primaryButtonText}>
                    Discover opportunities
                  </Text>
                </Pressable>
              </View>
            }
            ListFooterComponent={
              items.length > 0 ? (
                <View style={styles.localNote}>
                  <Ionicons
                    name="information-circle-outline"
                    size={17}
                    color={COLORS.muted}
                  />
                  <Text style={styles.localNoteText}>
                    Saved items are stored locally on this device.
                    They are not automatically synced to an online
                    account or another device.
                  </Text>
                </View>
              ) : null
            }
          />
        )}

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
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    backgroundColor: COLORS.background,
  },

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 11,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.muted,
    marginTop: 3,
  },

  bookmarkIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.paleBlue,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  listHeading: {
    marginBottom: 13,
  },

  countText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  listDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  card: {
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 13,
  },

  cardImage: {
    width: "100%",
    height: 155,
    backgroundColor: COLORS.paleBlue,
  },

  cardContent: {
    padding: 13,
  },

  category: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: COLORS.blue,
    marginBottom: 5,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },

  organization: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 7,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 7,
  },

  detailText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
  },

  savedDate: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 10,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 13,
  },

  primaryButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },

  removeButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0D6D6",
    backgroundColor: COLORS.white,
  },

  pressed: {
    opacity: 0.75,
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  stateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 25,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 7,
  },

  localNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 5,
    padding: 11,
    backgroundColor: COLORS.white,
    borderRadius: 11,
  },

  localNoteText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
  },
});