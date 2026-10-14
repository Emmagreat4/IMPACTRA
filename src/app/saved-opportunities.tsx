
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
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";

const SAVED_OPPORTUNITIES_KEY = "impactra_saved_opportunities";

const COLORS = {
  blue: "#155EEF",
  darkBlue: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EFF5FF",
  border: "#E5EBF4",
  text: "#172B4D",
  muted: "#7B8798",
  lightText: "#536985",
  error: "#C62828",
};

type SavedOpportunity = {
  id: string;
  opportunityId: string;
  title: string;
  organization: string;
  location: string;
  category: string;
  description: string;
  imageUri: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getLocation(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (!isRecord(value)) return "";

  return getString(value.cityCountry) ||
    [
      getString(value.city),
      getString(value.state, value.region),
      getString(value.country),
    ].filter(Boolean).join(", ");
}

function parseSavedOpportunities(raw: string | null): SavedOpportunity[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved opportunities data is invalid.");
  }

  const results: SavedOpportunity[] = [];

  for (const value of parsed) {
    if (!isRecord(value)) continue;

    const nested = isRecord(value.opportunity)
      ? value.opportunity
      : {};

    const title = getString(
      value.title,
      value.opportunityTitle,
      nested.title,
      nested.opportunityTitle
    );

    if (!title) continue;

    const opportunityId = getString(
      value.opportunityId,
      value._id,
      nested.opportunityId,
      nested._id,
      value.id,
      nested.id
    );

    const organizationValue =
      value.organization ?? nested.organization;

    const organization = isRecord(organizationValue)
      ? getString(
          organizationValue.name,
          organizationValue.organizationName
        )
      : getString(
          organizationValue,
          value.organizationName,
          nested.organizationName
        );

    const description = getString(
      value.description,
      value.summary,
      nested.description,
      nested.summary
    );

    const location = getLocation(
      value.location ?? nested.location
    );

    const category = getString(
      value.category,
      value.cause,
      nested.category,
      nested.cause
    );

    const imageUri = getString(
      value.imageUri,
      value.imageUrl,
      value.image,
      nested.imageUri,
      nested.imageUrl,
      nested.image
    );

    results.push({
      id: getString(value.savedId, value.id, value._id) ||
        opportunityId ||
        title,
      opportunityId,
      title,
      organization,
      location,
      category,
      description,
      imageUri: /^https?:\/\//i.test(imageUri)
        ? imageUri
        : "",
    });
  }

  return results;
}

function getStoredRecordKey(value: unknown): string {
  if (!isRecord(value)) return "";

  const nested = isRecord(value.opportunity)
    ? value.opportunity
    : {};

  return getString(
    value.savedId,
    value.id,
    value._id,
    value.opportunityId,
    nested.id,
    nested._id,
    nested.opportunityId,
    value.title,
    value.opportunityTitle,
    nested.title,
    nested.opportunityTitle
  );
}

export default function SavedOpportunitiesScreen() {
  const [opportunities, setOpportunities] = useState<
    SavedOpportunity[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [removingId, setRemovingId] = useState("");

  const loadSavedOpportunities = useCallback(async (
    pullToRefresh = false
  ) => {
    if (pullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setLoadError("");

    try {
      const raw = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY
      );

      const saved = parseSavedOpportunities(raw);
      setOpportunities(saved);
    } catch (error) {
      console.error("Unable to load saved opportunities:", error);
      setLoadError(
        "We couldn't read your saved opportunities. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedOpportunities();
    }, [loadSavedOpportunities])
  );

  const confirmRemove = (item: SavedOpportunity) => {
    Alert.alert(
      "Remove saved opportunity?",
      `Remove "${item.title}" from your saved list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void removeOpportunity(item);
          },
        },
      ]
    );
  };

  const removeOpportunity = async (item: SavedOpportunity) => {
    setRemovingId(item.id);

    try {
      const raw = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY
      );

      const parsed: unknown = raw ? JSON.parse(raw) : [];

      if (!Array.isArray(parsed)) {
        throw new Error("Saved opportunities data is invalid.");
      }

      const updated = parsed.filter(
        (record) => getStoredRecordKey(record) !== item.id
      );

      await AsyncStorage.setItem(
        SAVED_OPPORTUNITIES_KEY,
        JSON.stringify(updated)
      );

      setOpportunities((current) =>
        current.filter((saved) => saved.id !== item.id)
      );
    } catch (error) {
      console.error("Unable to remove saved opportunity:", error);

      Alert.alert(
        "Couldn't remove opportunity",
        "Your saved list could not be updated. Please try again."
      );
    } finally {
      setRemovingId("");
    }
  };

  const openOpportunity = (item: SavedOpportunity) => {
    if (!item.opportunityId) {
      Alert.alert(
        "Listing details unavailable",
        "This saved record doesn't contain the original opportunity ID. Open Discover to check whether the listing is available."
      );
      return;
    }

    router.push({
      pathname: "/opportunity",
      params: {
        id: item.opportunityId,
        title: item.title,
        organization: item.organization,
      },
    });
  };

  const renderItem = ({ item }: { item: SavedOpportunity }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.listingImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.listingIcon}>
            <Ionicons
              name="leaf-outline"
              size={24}
              color={COLORS.blue}
            />
          </View>
        )}

        <View style={styles.cardText}>
          <Text style={styles.opportunityTitle}>
            {item.title}
          </Text>

          {item.organization ? (
            <Text style={styles.organization}>
              {item.organization}
            </Text>
          ) : null}

          {item.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.category}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={styles.removeButton}
          onPress={() => confirmRemove(item)}
          disabled={removingId === item.id}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.title} from saved opportunities`}
          hitSlop={8}
        >
          {removingId === item.id ? (
            <ActivityIndicator
              size="small"
              color={COLORS.error}
            />
          ) : (
            <Ionicons
              name="bookmark"
              size={19}
              color={COLORS.blue}
            />
          )}
        </Pressable>
      </View>

      {item.location ? (
        <View style={styles.metadataRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={COLORS.muted}
          />
          <Text style={styles.metadataText}>
            {item.location}
          </Text>
        </View>
      ) : null}

      {item.description ? (
        <Text
          style={styles.description}
          numberOfLines={3}
        >
          {item.description}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.detailsButton,
          pressed && styles.pressed,
        ]}
        onPress={() => openOpportunity(item)}
        accessibilityRole="button"
      >
        <Text style={styles.detailsButtonText}>
          View opportunity
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={COLORS.blue}
        />
      </Pressable>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />
          <Text style={styles.stateText}>
            Loading saved opportunities...
          </Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.stateContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={COLORS.blue}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Unable to load saved opportunities
          </Text>

          <Text style={styles.emptyText}>
            {loadError}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => void loadSavedOpportunities()}
            accessibilityRole="button"
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={COLORS.white}
            />
            <Text style={styles.primaryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
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

        <Text style={styles.emptyText}>
          Opportunities you save will appear here, so you can return
          to their details later. No sample listings have been added.
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
            Explore opportunities
          </Text>
        </Pressable>
      </View>
    );
  };

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
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/opportunities");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Saved opportunities
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <FlatList
          data={loading || loadError ? [] : opportunities}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={styles.pageIntro}>
              <Text style={styles.pageTitle}>
                Your saved list
              </Text>

              <Text style={styles.pageDescription}>
                Keep opportunities you want to revisit in one place.
              </Text>

              {!loading && !loadError && opportunities.length > 0 ? (
                <Text style={styles.countText}>
                  {opportunities.length}{" "}
                  {opportunities.length === 1
                    ? "saved opportunity"
                    : "saved opportunities"}
                </Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadSavedOpportunities(true)}
              tintColor={COLORS.blue}
              colors={[COLORS.blue]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 7,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSpace: {
    width: 39,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 19,
    paddingBottom: 22,
  },

  pageIntro: {
    marginBottom: 17,
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
  },

  pageDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  countText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 12,
  },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 12,
    marginBottom: 11,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  listingImage: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: COLORS.paleBlue,
  },

  listingIcon: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: {
    flex: 1,
    minWidth: 0,
  },

  opportunityTitle: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  organization: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
  },

  categoryText: {
    color: COLORS.darkBlue,
    fontSize: 9,
    fontWeight: "700",
  },

  removeButton: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },

  metadataText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  description: {
    color: COLORS.lightText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },

  detailsButton: {
    minHeight: 39,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 12,
    paddingHorizontal: 10,
  },

  detailsButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
  },

  stateContainer: {
    flexGrow: 1,
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 25,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 15,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 310,
    marginTop: 8,
  },

  stateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },

  primaryButton: {
    minHeight: 44,
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 19,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },
});
