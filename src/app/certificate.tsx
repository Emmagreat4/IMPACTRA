
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
};

export default function CertificateScreen() {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/my-profile");
    }
  };

  const openHistory = () => {
    router.push("/contribution-history");
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
            onPress={handleBack}
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
            My certificates
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <View style={styles.intro}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="ribbon-outline"
                size={31}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.pageTitle}>
              Your certificates
            </Text>

            <Text style={styles.pageDescription}>
              View certificates issued for your verified volunteer
              contributions.
            </Text>
          </View>

          <View style={styles.certificateCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="document-text-outline"
                size={31}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No certificate available yet
            </Text>

            <Text style={styles.emptyDescription}>
              There are no genuine issued certificates available to
              display here yet. A contribution saved on this device
              does not automatically create an official certificate.
            </Text>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.blue}
              />

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  How certificates become available
                </Text>

                <Text style={styles.infoText}>
                  The participating organization must verify your
                  contribution, and the connected certificate service
                  must issue the certificate before IMPACTRA can
                  display or download it.
                </Text>
              </View>
            </View>

            <View style={styles.unavailableRow}>
              <Ionicons
                name="cloud-offline-outline"
                size={18}
                color={COLORS.muted}
              />

              <Text style={styles.unavailableText}>
                Online certificate issuance and downloads are not
                connected yet.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={openHistory}
            accessibilityRole="button"
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={COLORS.white}
            />

            <Text style={styles.primaryButtonText}>
              View contribution history
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/my-profile")}
            accessibilityRole="button"
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.blue}
            />

            <Text style={styles.secondaryButtonText}>
              Back to My Profile
            </Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Certificate details, verification records, downloads and
            sharing will be enabled when the genuine certificate
            service is connected.
          </Text>
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
    minHeight: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
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
  },

  headerSpace: {
    width: 39,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 30,
  },

  intro: {
    alignItems: "center",
    marginBottom: 22,
  },

  heroIcon: {
    width: 59,
    height: 59,
    borderRadius: 18,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 13,
  },

  pageDescription: {
    maxWidth: 320,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },

  certificateCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
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

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },

  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 11,
    padding: 12,
    marginTop: 19,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: COLORS.darkBlue,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },

  infoText: {
    color: COLORS.lightText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  unavailableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 7,
    marginTop: 15,
  },

  unavailableText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
  },

  primaryButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.blue,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 19,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#C8D8EF",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "800",
  },

  footerNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 17,
    paddingHorizontal: 6,
  },

  pressed: {
    opacity: 0.75,
  },
});
