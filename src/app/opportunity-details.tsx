
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type RouteParam = string | string[] | undefined;

type OpportunityParams = {
  id?: RouteParam;
  opportunityId?: RouteParam;
  title?: RouteParam;
  opportunityTitle?: RouteParam;
  organization?: RouteParam;
  category?: RouteParam;
  location?: RouteParam;
  date?: RouteParam;
  type?: RouteParam;
  hours?: RouteParam;
  description?: RouteParam;
  responsibilities?: RouteParam;
  requirements?: RouteParam;
  capacity?: RouteParam;
  available?: RouteParam;
  imageUrl?: RouteParam;
  startTime?: RouteParam;
  availableSpots?: RouteParam;
};

type SavedOpportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  date: string;
  type: string;
  hours: string;
  description: string;
  responsibilities: string;
  requirements: string;
  capacity: string;
  available: string;
  imageUrl: string;
  startTime: string;
  availableSpots: string;
  savedAt: string;
};

const SAVED_OPPORTUNITIES_KEY = "impactra_saved_opportunities";

const COLORS = {
  primary: "#155EEF",
  primaryDark: "#123B70",
  background: "#F7F9FD",
  white: "#FFFFFF",
  paleBlue: "#EAF2FF",
  border: "#E0E7F0",
  text: "#172B4D",
  muted: "#718096",
  lightText: "#536985",
  error: "#C62828",
};

function getParam(value: RouteParam): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseSavedOpportunities(
  raw: string | null,
): SavedOpportunity[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved opportunity data is invalid.");
  }

  return parsed.filter(
    (item): item is SavedOpportunity =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.savedAt === "string",
  );
}

function parseResponsibilities(value: string): string[] {
  if (!value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );
    }
  } catch {
    // Accept plain text supplied by a genuine opportunity listing.
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getNumericParam(value: string): number | null {
  if (!value.trim()) return null;

  const result = Number(value);

  return Number.isFinite(result) && result >= 0
    ? result
    : null;
}

export default function OpportunityDetailsScreen() {
  const params = useLocalSearchParams<OpportunityParams>();

  const opportunityId =
    getParam(params.id) || getParam(params.opportunityId);

  const title =
    getParam(params.title) || getParam(params.opportunityTitle);

  const organization = getParam(params.organization);
  const category = getParam(params.category);
  const location = getParam(params.location);
  const date = getParam(params.date);
  const opportunityType = getParam(params.type);
  const hours = getParam(params.hours);
  const description = getParam(params.description);
  const requirements = getParam(params.requirements);
  const imageUrl = getParam(params.imageUrl);
  const startTime = getParam(params.startTime);
  const availableSpots = getParam(params.availableSpots);
  const responsibilitiesValue = getParam(params.responsibilities);

  const responsibilities = parseResponsibilities(
    responsibilitiesValue,
  );

  const capacityString = getParam(params.capacity);
  const availableString = getParam(params.available);

  const capacity = getNumericParam(capacityString);
  const available = getNumericParam(availableString);

  const hasCapacity =
    capacity !== null &&
    available !== null &&
    capacity > 0 &&
    available <= capacity;

  const hasOpportunity =
    opportunityId.trim().length > 0 &&
    title.trim().length > 0;

  const [isSaved, setIsSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Refresh bookmark status whenever the screen gains focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function checkSavedOpportunity() {
        setCheckingSaved(true);
        setLoadError("");

        if (!hasOpportunity) {
          setIsSaved(false);
          setCheckingSaved(false);
          return;
        }

        try {
          const raw = await AsyncStorage.getItem(
            SAVED_OPPORTUNITIES_KEY,
          );

          const savedItems = parseSavedOpportunities(raw);

          if (active) {
            setIsSaved(
              savedItems.some(
                (item) => item.id === opportunityId,
              ),
            );
          }
        } catch (error) {
          console.error(
            "Unable to load saved opportunities:",
            error,
          );

          if (active) {
            setLoadError(
              "Saved opportunities could not be checked. Please try again.",
            );
          }
        } finally {
          if (active) setCheckingSaved(false);
        }
      }

      void checkSavedOpportunity();

      return () => {
        active = false;
      };
    }, [opportunityId, hasOpportunity]),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/opportunities");
    }
  };

  // This opens the form. It does not submit an application.
  const handleApply = () => {
    if (!hasOpportunity) {
      Alert.alert(
        "Opportunity unavailable",
        "A valid opportunity ID and title are required before an application can be started.",
      );
      return;
    }

    router.push({
      pathname: "/application-form",
      params: {
        id: opportunityId,
        title,
        organization,
        category,
        location,
        date,
        type: opportunityType,
        hours,
        description,
        responsibilities: responsibilitiesValue,
        requirements,
        capacity: capacityString,
        available: availableString,
        imageUrl,
        startTime,
        availableSpots,
      },
    });
  };

  // Saving a bookmark is separate from an application.
  const handleToggleSaved = async () => {
    if (!hasOpportunity) {
      Alert.alert(
        "Opportunity unavailable",
        "This screen does not have a complete opportunity record to save.",
      );
      return;
    }

    try {
      setSaving(true);
      setLoadError("");

      const raw = await AsyncStorage.getItem(
        SAVED_OPPORTUNITIES_KEY,
      );

      const savedItems = parseSavedOpportunities(raw);

      const alreadySaved = savedItems.some(
        (item) => item.id === opportunityId,
      );

      if (alreadySaved) {
        const updatedItems = savedItems.filter(
          (item) => item.id !== opportunityId,
        );

        await AsyncStorage.setItem(
          SAVED_OPPORTUNITIES_KEY,
          JSON.stringify(updatedItems),
        );

        setIsSaved(false);
      } else {
        const record: SavedOpportunity = {
          id: opportunityId,
          title,
          organization,
          category,
          location,
          date,
          type: opportunityType,
          hours,
          description,
          responsibilities: responsibilitiesValue,
          requirements,
          capacity: capacityString,
          available: availableString,
          imageUrl,
          startTime,
          availableSpots,
          savedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(
          SAVED_OPPORTUNITIES_KEY,
          JSON.stringify([...savedItems, record]),
        );

        setIsSaved(true);
      }
    } catch (error) {
      console.error(
        "Unable to update saved opportunities:",
        error,
      );

      Alert.alert(
        "Unable to update saved list",
        "The bookmark could not be changed. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const retrySavedCheck = () => {
    router.replace({
      pathname: "/opportunity-details",
      params,
    });
  };

  const openOpportunities = () => {
    router.replace("/opportunities");
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
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
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
          {!hasOpportunity ? (
            <View style={styles.emptyState}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Opportunity details unavailable
              </Text>

              <Text style={styles.emptyText}>
                This screen did not receive a complete opportunity
                record. Genuine listing details must come from
                Discover or the connected opportunities service.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={openOpportunities}
                accessibilityRole="button"
              >
                <Ionicons
                  name="compass-outline"
                  size={18}
                  color={COLORS.white}
                />
                <Text style={styles.primaryButtonText}>
                  Back to Discover
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="briefcase-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>{title}</Text>

              {organization ? (
                <Text style={styles.organization}>
                  {organization}
                </Text>
              ) : null}

              <View style={styles.notice}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.noticeText}>
                  Details shown here come from the selected listing.
                  Organization verification and application status
                  are not independently confirmed on this screen.
                </Text>
              </View>

              {(location || date || hours || startTime || availableSpots) ? (
                <View style={styles.detailsCard}>
                  {location ? (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="location-outline"
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue}>{location}</Text>
                    </View>
                  ) : null}

                  {date ? (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{date}</Text>
                    </View>
                  ) : null}

                  {startTime ? (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="time-outline"
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.detailLabel}>Start time</Text>
                      <Text style={styles.detailValue}>{startTime}</Text>
                    </View>
                  ) : null}

                  {hours ? (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="hourglass-outline"
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>{hours}</Text>
                    </View>
                  ) : null}

                  {availableSpots ? (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIcon}>
                        <Ionicons
                          name="people-outline"
                          size={19}
                          color={COLORS.primary}
                        />
                      </View>

                      <Text style={styles.detailLabel}>
                        Available places
                      </Text>
                      <Text style={styles.detailValue}>
                        {availableSpots}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {(category || opportunityType) ? (
                <View style={styles.tagRow}>
                  {category ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{category}</Text>
                    </View>
                  ) : null}

                  {opportunityType ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {opportunityType}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    About this opportunity
                  </Text>
                  <Text style={styles.bodyText}>{description}</Text>
                </View>
              ) : null}

              {responsibilities.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    What you will do
                  </Text>

                  {responsibilities.map((responsibility, index) => (
                    <View
                      key={`${index}-${responsibility}`}
                      style={styles.bulletRow}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color={COLORS.primary}
                      />
                      <Text style={styles.bulletText}>
                        {responsibility}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {requirements ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Requirements
                  </Text>
                  <Text style={styles.bodyText}>{requirements}</Text>
                </View>
              ) : null}

              {hasCapacity ? (
                <View style={styles.capacityCard}>
                  <Text style={styles.capacityLabel}>
                    Volunteer availability
                  </Text>

                  <Text style={styles.capacityValue}>
                    {available} of {capacity} places available
                  </Text>

                  <View style={styles.capacityBackground}>
                    <View
                      style={[
                        styles.capacityBar,
                        {
                          width: `${
                            ((capacity - available!) / capacity!) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ) : null}

              {loadError ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={COLORS.error}
                  />

                  <View style={styles.errorContent}>
                    <Text style={styles.errorText}>{loadError}</Text>

                    <Pressable onPress={retrySavedCheck}>
                      <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* Opens the form. It does not submit anything. */}
              <Pressable
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleApply}
                accessibilityRole="button"
                accessibilityLabel="Continue to application form"
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={COLORS.white}
                />
                <Text style={styles.applyButtonText}>
                  Continue to application
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={COLORS.white}
                />
              </Pressable>

              {/* Bookmark action remains independent from applying. */}
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  isSaved && styles.savedButton,
                  (checkingSaved || saving || !!loadError) &&
                    styles.disabledButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleToggleSaved}
                disabled={checkingSaved || saving || !!loadError}
                accessibilityRole="button"
                accessibilityLabel={
                  isSaved
                    ? "Remove from saved opportunities"
                    : "Save opportunity"
                }
              >
                {checkingSaved || saving ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                ) : (
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={19}
                    color={COLORS.primary}
                  />
                )}

                <Text style={styles.saveButtonText}>
                  {checkingSaved
                    ? "Checking saved list..."
                    : saving
                      ? "Updating saved list..."
                      : isSaved
                        ? "Saved on this device · Remove"
                        : "Save opportunity"}
                </Text>
              </Pressable>

              <Text style={styles.footerNotice}>
                Continuing opens the application form; it does not submit
                anything. Saved opportunities remain on this device.
                Online application submission requires a connected backend.
              </Text>
            </>
          )}
        </ScrollView>
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
    minHeight: 62,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSpace: {
    width: 40,
  },

  container: {
    paddingHorizontal: 19,
    paddingTop: 23,
    paddingBottom: 35,
  },

  heroIcon: {
    width: 63,
    height: 63,
    borderRadius: 18,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  title: {
    marginTop: 15,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  organization: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.paleBlue,
    borderRadius: 11,
    padding: 12,
    marginTop: 18,
    gap: 9,
  },

  noticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.lightText,
  },

  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
    padding: 13,
    gap: 14,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  detailLabel: {
    flex: 1,
    fontSize: 11,
    color: COLORS.muted,
  },

  detailValue: {
    maxWidth: "57%",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "right",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },

  tag: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  tagText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },

  section: {
    marginTop: 23,
  },

  sectionTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 9,
  },

  bodyText: {
    fontSize: 12,
    lineHeight: 20,
    color: COLORS.lightText,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 9,
  },

  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.lightText,
  },

  capacityCard: {
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
    padding: 14,
    marginTop: 22,
  },

  capacityLabel: {
    fontSize: 11,
    color: COLORS.lightText,
  },

  capacityValue: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },

  capacityBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D4E2F7",
    marginTop: 12,
    overflow: "hidden",
  },

  capacityBar: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  applyButton: {
    minHeight: 49,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
    marginTop: 24,
  },

  applyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    flexShrink: 1,
  },

  saveButton: {
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#C8D8EF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
    marginTop: 10,
  },

  saveButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  savedButton: {
    backgroundColor: COLORS.paleBlue,
    borderColor: "#C8D8EF",
  },

  disabledButton: {
    opacity: 0.65,
  },

  footerNotice: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: "center",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF1F0",
    borderRadius: 10,
    padding: 12,
    gap: 9,
    marginTop: 17,
  },

  errorContent: {
    flex: 1,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 17,
  },

  retryText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 7,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 380,
    paddingHorizontal: 8,
  },

  emptyTitle: {
    marginTop: 17,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 20,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 9,
    maxWidth: 340,
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 22,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },
});
