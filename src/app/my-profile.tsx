
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import VolunteerBottomNav from "../components/volunteer-bottom-nav";
import { getUser } from "../utils/storage";

const PROFILE_STORAGE_KEY = "impactra_profile";
const INTERESTS_STORAGE_KEY = "impactra_interests";
const SKILLS_STORAGE_KEY = "impactra_skills";
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
  lightText: "#536985",
  error: "#C62828",
};

type DataRecord = Record<string, unknown>;

type ProfileViewData = {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  avatarUri: string;
  interests: string[];
  skills: string[];
  savedContributionCount: number;
};

const EMPTY_PROFILE: ProfileViewData = {
  firstName: "",
  lastName: "",
  fullName: "",
  username: "",
  email: "",
  bio: "",
  location: "",
  avatarUri: "",
  interests: [],
  skills: [],
  savedContributionCount: 0,
};

function isRecord(value: unknown): value is DataRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseObject(value: string | null): DataRecord {
  if (!value) return {};

  const parsed: unknown = JSON.parse(value);

  if (!isRecord(parsed)) {
    throw new Error("Saved profile data is invalid.");
  }

  return parsed;
}

function parseArray(value: string | null): unknown[] {
  if (!value) return [];

  const parsed: unknown = JSON.parse(value);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved list data is invalid.");
  }

  return parsed;
}

function getString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function extractStringList(value: unknown): string[] {
  let parsed = value;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return parsed.trim() ? [parsed.trim()] : [];
    }
  }

  if (!Array.isArray(parsed)) {
    if (isRecord(parsed)) {
      parsed =
        parsed.interests ??
        parsed.selectedInterests ??
        parsed.skills ??
        parsed.selectedSkills ??
        parsed.items;
    }

    if (!Array.isArray(parsed)) return [];
  }

  const items = (parsed as unknown[])
    .map((item) => {
      if (typeof item === "string") return item.trim();

      if (isRecord(item)) {
        return getString(
          item.name,
          item.label,
          item.title,
          item.value
        );
      }

      return "";
    })
    .filter(Boolean);

  return [...new Set(items)];
}

function getLocation(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (!isRecord(value)) return "";

  return (
    getString(value.cityCountry) ||
    [
      getString(value.city),
      getString(value.state, value.region),
      getString(value.country),
    ]
      .filter(Boolean)
      .join(", ")
  );
}

function getAvatarUri(
  profile: DataRecord,
  account: DataRecord
): string {
  const profileAvatar = isRecord(profile.avatar)
    ? profile.avatar
    : {};

  const accountAvatar = isRecord(account.avatar)
    ? account.avatar
    : {};

  return getString(
    profile.avatarUri,
    profile.avatarUrl,
    profile.photoURL,
    profile.photoUrl,
    profile.imageUri,
    profileAvatar.uri,
    account.avatarUri,
    account.avatarUrl,
    account.photoURL,
    account.photoUrl,
    accountAvatar.uri
  );
}

function getSavedContributionCount(
  value: string | null
): number {
  try {
    return parseArray(value).filter(
      (item) => isRecord(item) && typeof item.id === "string"
    ).length;
  } catch (error) {
    console.warn(
      "Unable to count saved contribution records:",
      error
    );

    return 0;
  }
}

function safeStringList(value: string | null): string[] {
  try {
    return extractStringList(value);
  } catch {
    return [];
  }
}

export default function MyProfileScreen() {
  const [profile, setProfile] =
    useState<ProfileViewData>(EMPTY_PROFILE);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        setLoading(true);
        setLoadError("");

        try {
          const [
            savedProfile,
            savedInterests,
            savedSkills,
            savedContributions,
            savedUser,
          ] = await Promise.all([
            AsyncStorage.getItem(PROFILE_STORAGE_KEY),
            AsyncStorage.getItem(INTERESTS_STORAGE_KEY),
            AsyncStorage.getItem(SKILLS_STORAGE_KEY),
            AsyncStorage.getItem(CONTRIBUTIONS_KEY),
            getUser(),
          ]);

          const savedProfileData = parseObject(savedProfile);

          const account: DataRecord = isRecord(savedUser)
            ? savedUser
            : {};

          const firstName = getString(
            savedProfileData.firstName,
            account.firstName
          );

          const lastName = getString(
            savedProfileData.lastName,
            account.lastName
          );

          const savedInterestsFromProfile = extractStringList(
            savedProfileData.interests ?? account.interests
          );

          const separateInterests =
            safeStringList(savedInterests);

          const savedSkillsFromProfile = extractStringList(
            savedProfileData.skills ?? account.skills
          );

          const separateSkills = safeStringList(savedSkills);

          const nextProfile: ProfileViewData = {
            firstName,
            lastName,
            fullName: getString(
              savedProfileData.fullName,
              account.fullName,
              savedProfileData.name,
              account.name
            ),
            username: getString(
              account.username,
              savedProfileData.username
            ),
            email: getString(
              savedProfileData.email,
              account.email
            ),
            bio: getString(
              savedProfileData.bio,
              account.bio
            ),
            location:
              getLocation(savedProfileData.location) ||
              getLocation(account.location),
            avatarUri: getAvatarUri(
              savedProfileData,
              account
            ),
            interests:
              savedInterestsFromProfile.length > 0
                ? savedInterestsFromProfile
                : separateInterests,
            skills:
              savedSkillsFromProfile.length > 0
                ? savedSkillsFromProfile
                : separateSkills,
            savedContributionCount:
              getSavedContributionCount(savedContributions),
          };

          if (!active) return;

          setProfile(nextProfile);
          setAvatarFailed(false);
        } catch (error) {
          console.error("Unable to load profile:", error);

          if (active) {
            setLoadError(
              "Your profile information could not be loaded. Please try again."
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadProfile();

      return () => {
        active = false;
      };
    }, [reloadKey])
  );

  const fullName =
    profile.fullName ||
    `${profile.firstName} ${profile.lastName}`.trim() ||
    profile.username ||
    "Profile not completed";

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

  const handleEditProfile = () => {
    router.push("/profile");
  };

  const handleReturnToLogin = () => {
    Alert.alert(
      "Open login",
      "This opens the login screen. It does not sign you out of a server session; authentication sign-out still needs to be connected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open login",
          onPress: () => router.replace("/login"),
        },
      ]
    );
  };

  const renderTags = (
    items: string[],
    emptyMessage: string
  ) => {
    if (items.length === 0) {
      return (
        <Text style={styles.emptySectionText}>
          {emptyMessage}
        </Text>
      );
    }

    return (
      <View style={styles.tags}>
        {items.map((item, index) => (
          <View
            key={`${item}-${index}`}
            style={styles.tag}
          >
            <Text style={styles.tagText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.blue}
          />
          <Text style={styles.stateText}>
            Loading your profile...
          </Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.stateContainer}>
          <View style={styles.stateIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={29}
              color={COLORS.error}
            />
          </View>

          <Text style={styles.stateTitle}>
            Profile unavailable
          </Text>

          <Text style={styles.stateDescription}>
            {loadError}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              setReloadKey((value) => value + 1)
            }
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
      <>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {profile.avatarUri && !avatarFailed ? (
              <Image
                key={profile.avatarUri}
                source={{ uri: profile.avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
                accessibilityLabel="Profile photo"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <Text style={styles.avatarText}>
                {initials}
              </Text>
            )}
          </View>

          <Text style={styles.name}>{fullName}</Text>

          {profile.email ? (
            <Text style={styles.email}>
              {profile.email}
            </Text>
          ) : (
            <Text style={styles.mutedLine}>
              Email not added
            </Text>
          )}

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color={COLORS.muted}
            />
            <Text style={styles.location}>
              {profile.location || "Location not added"}
            </Text>
          </View>

          <Text style={styles.bio}>
            {profile.bio || "You haven't added a bio yet."}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.outlineButton,
              pressed && styles.pressed,
            ]}
            onPress={handleEditProfile}
            accessibilityRole="button"
          >
            <Ionicons
              name="create-outline"
              size={16}
              color={COLORS.blue}
            />
            <Text style={styles.outlineButtonText}>
              Edit profile
            </Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Profile overview
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {profile.savedContributionCount}
              </Text>
              <Text style={styles.summaryLabel}>
                Saved records
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {profile.interests.length}
              </Text>
              <Text style={styles.summaryLabel}>
                Interests
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {profile.skills.length}
              </Text>
              <Text style={styles.summaryLabel}>
                Skills
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.localNotice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.blue}
          />
          <Text style={styles.localNoticeText}>
            This overview uses information saved on this device.
            Official verified hours and impact totals will only
            be displayed when confirmed by the connected service.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>

            <Pressable
              onPress={() => router.push("/interests")}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.sectionAction}>Edit</Text>
            </Pressable>
          </View>

          {renderTags(
            profile.interests,
            "No interests saved yet. Add your interests to help describe the causes you care about."
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>

          {renderTags(
            profile.skills,
            "No skills saved yet. Your skills will appear here when they have been added to your profile."
          )}
        </View>

        <Text style={styles.activityHeading}>My activity</Text>

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push("/contribution-history")
          }
          accessibilityRole="button"
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="time-outline"
              size={21}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Contribution history
            </Text>
            <Text style={styles.menuDescription}>
              Review saved contribution records and available status updates.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/certificate")}
          accessibilityRole="button"
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="ribbon-outline"
              size={21}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>My certificates</Text>
            <Text style={styles.menuDescription}>
              View certificates available in the app.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            Alert.alert(
              "Impact profile",
              "Public sharing is not connected yet. No public profile has been created or shared."
            )
          }
          accessibilityRole="button"
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="person-circle-outline"
              size={21}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Impact profile</Text>
            <Text style={styles.menuDescription}>
              Public profile sharing is not available yet.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={COLORS.muted}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.pressed,
          ]}
          onPress={handleReturnToLogin}
          accessibilityRole="button"
        >
          <Ionicons
            name="log-in-outline"
            size={19}
            color={COLORS.blue}
          />
          <Text style={styles.loginButtonText}>
            Open login screen
          </Text>
        </Pressable>
      </>
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
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
            hitSlop={8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>My profile</Text>

          <Pressable
            style={({ pressed }) => [
              styles.headerEditButton,
              pressed && styles.pressed,
            ]}
            onPress={handleEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={COLORS.blue}
            />
            <Text style={styles.headerEditText}>Edit</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>

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
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    paddingHorizontal: 6,
  },
  headerEditButton: {
    minWidth: 52,
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  headerEditText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: "hidden",
    backgroundColor: COLORS.paleBlue,
    borderWidth: 2,
    borderColor: "#C8D9F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: COLORS.blue,
    fontSize: 27,
    fontWeight: "800",
  },
  name: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  email: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },
  mutedLine: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 9,
  },
  location: {
    color: COLORS.muted,
    fontSize: 11,
  },
  bio: {
    color: COLORS.lightText,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 11,
  },
  outlineButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#C8D8EF",
    borderRadius: 9,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 14,
  },
  outlineButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
  },
  summaryCard: {
    backgroundColor: COLORS.blue,
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingVertical: 14,
    marginTop: 13,
  },
  summaryTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 7,
    marginBottom: 13,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  summaryNumber: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  summaryLabel: {
    color: "#E2EBFF",
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 33,
    backgroundColor: "#8DB3FF",
  },
  localNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 11,
    marginTop: 11,
  },
  localNoticeText: {
    flex: 1,
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 16,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    marginBottom: 10,
  },
  sectionAction: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  tag: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#C9D9ED",
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },
  tagText: {
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 15,
  },
  emptySectionText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  activityHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 3,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 9,
  },
  menuIcon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 7,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  menuDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  loginButton: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#C8D8EF",
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginTop: 20,
  },
  loginButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
  },
  stateContainer: {
    minHeight: 330,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 25,
  },
  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
  },
  stateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },
  stateDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  primaryButton: {
    minHeight: 43,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    marginTop: 17,
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
