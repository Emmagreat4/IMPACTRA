import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser } from "../utils/storage";

const PROFILE_STORAGE_KEY = "impactra_profile";

export default function MyProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [savedProfile, savedUser] = await Promise.all([
        AsyncStorage.getItem(PROFILE_STORAGE_KEY),
        getUser(),
      ]);

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);

          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setBio(profile.bio || "");
          setLocation(profile.location || "");
        } catch (error) {
          console.log("Unable to read saved profile:", error);
        }
      }

      if (savedUser) {
        setUsername(savedUser.username || "");

        if (!savedProfile) {
          setFirstName(savedUser.firstName || "");
          setLastName(savedUser.lastName || "");
          setBio(savedUser.bio || "");
          setLocation(savedUser.location || "");
        }
      }
    } catch (error) {
      console.log("Unable to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.replace("/home");
  };

  const handleEdit = () => {
    router.push("/profile");
  };

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    username ||
    "Your name";

  const avatarLetter =
    firstName.trim().charAt(0).toUpperCase() ||
    username.trim().charAt(0).toUpperCase() ||
    "U";

  const displayLocation =
    location.trim() || "Location not set";

  const displayBio =
    bio.trim() || "No bio added yet.";

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={handleBack}
          hitSlop={8}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#111111"
          />

          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.headerTitle}>My profile</Text>

        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
          onPress={handleEdit}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* PROFILE */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {avatarLetter}
            </Text>
          </View>

          <Text style={styles.name}>
            {loading ? "Loading..." : fullName}
          </Text>

          <Text style={styles.location}>
            {loading ? "Loading..." : displayLocation}
          </Text>

          <Text style={styles.bio}>
            {loading ? "Loading profile..." : displayBio}
          </Text>
        </View>

        {/* IMPACT SUMMARY */}
        <View style={styles.impactCard}>
          <Text style={styles.cardTitle}>My impact</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>
                Verified hours
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>
                Organizations
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>
                Certificates
              </Text>
            </View>
          </View>
        </View>

        {/* INTERESTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Healthcare
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Education
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Community Development
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Technology
              </Text>
            </View>
          </View>
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Communication
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Teaching
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Social Media
              </Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Event Planning
              </Text>
            </View>
          </View>
        </View>

        {/* CONTRIBUTION HISTORY */}
        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push("/contribution-history")
          }
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#0958D9"
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Contribution history
            </Text>

            <Text style={styles.menuDescription}>
              View your submitted and verified volunteer work.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* CERTIFICATES */}
        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/certificate")}
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="ribbon-outline"
              size={20}
              color="#0958D9"
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              My certificates
            </Text>

            <Text style={styles.menuDescription}>
              Access certificates for your verified contributions.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* IMPACT PROFILE */}
        <Pressable
          style={({ pressed }) => [
            styles.menuCard,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            Alert.alert(
              "Impact profile",
              "Your public impact profile will be connected later."
            );
          }}
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name="person-circle-outline"
              size={20}
              color="#0958D9"
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              Impact profile
            </Text>

            <Text style={styles.menuDescription}>
              Share a trusted record of the impact you have made.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* SIGN OUT */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.signOutText}>
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  header: {
    height: 72,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EBF0",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    minWidth: 72,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#F2F5F8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#111111",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  editButton: {
    minWidth: 48,
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  editText: {
    color: "#0958D9",
    fontSize: 13,
    fontWeight: "600",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 45,
  },

  profileSection: {
    alignItems: "center",
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#EAF2FF",
    borderWidth: 2,
    borderColor: "#B7CCE8",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0958D9",
  },

  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
  },

  location: {
    marginTop: 4,
    fontSize: 12,
    color: "#6D7782",
  },

  bio: {
    maxWidth: 350,
    marginTop: 11,
    fontSize: 12,
    lineHeight: 18,
    color: "#66717D",
    textAlign: "center",
  },

  impactCard: {
    backgroundColor: "#0958D9",
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginTop: 24,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    paddingHorizontal: 10,
    marginBottom: 17,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
  },

  statLabel: {
    color: "#DCE9FF",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#4B8BE8",
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 11,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    borderWidth: 1,
    borderColor: "#C9D7E4",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  tagText: {
    fontSize: 11,
    color: "#59636E",
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E6EC",
    borderRadius: 13,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  menuContent: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 8,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },

  menuDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: "#747E89",
    marginTop: 3,
  },

  arrow: {
    color: "#0958D9",
    fontSize: 23,
  },

  signOutButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D5DDE5",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  signOutText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.75,
  },
});