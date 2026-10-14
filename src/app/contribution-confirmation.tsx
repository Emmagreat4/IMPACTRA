
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function ContributionConfirmationScreen() {
  const params = useLocalSearchParams<{
    title?: string | string[];
    opportunityTitle?: string | string[];
    hours?: string | string[];
    date?: string | string[];
    organization?: string | string[];
  }>();

  const title =
    getParam(params.title) ||
    getParam(params.opportunityTitle);

  const organization = getParam(params.organization);
  const hoursValue = getParam(params.hours);
  const date = getParam(params.date);

  const parsedHours =
    hoursValue.trim() !== "" ? Number(hoursValue) : Number.NaN;

  const hasValidHours =
    Number.isFinite(parsedHours) && parsedHours > 0;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/log-hours");
    }
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
            Contribution confirmation
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark"
                size={36}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.pageTitle}>
              Contribution record saved
            </Text>

            <Text style={styles.pageDescription}>
              Your contribution details were saved on this device.
            </Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={COLORS.blue}
                />
              </View>

              <View style={styles.statusTextBlock}>
                <Text style={styles.statusTitle}>
                  Saved locally
                </Text>

                <Text style={styles.statusDescription}>
                  This record is stored in this installation of IMPACTRA.
                </Text>
              </View>
            </View>

            {title || organization || hasValidHours || date ? (
              <View style={styles.details}>
                <Text style={styles.detailsHeading}>
                  Contribution details
                </Text>

                {title ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Opportunity
                    </Text>
                    <Text style={styles.detailValue}>
                      {title}
                    </Text>
                  </View>
                ) : null}

                {organization ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Organization
                    </Text>
                    <Text style={styles.detailValue}>
                      {organization}
                    </Text>
                  </View>
                ) : null}

                {hasValidHours ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Hours recorded
                    </Text>
                    <Text style={styles.detailValue}>
                      {parsedHours}{" "}
                      {parsedHours === 1 ? "hour" : "hours"}
                    </Text>
                  </View>
                ) : null}

                {date ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      Activity date
                    </Text>
                    <Text style={styles.detailValue}>
                      {date}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.blue}
            />

            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                This is not an online submission
              </Text>

              <Text style={styles.noticeText}>
                Your record has not been sent to the organization by
                this screen. Online submission, organization review,
                and verification require the real backend service.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/contribution-history")}
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
            onPress={() => router.replace("/log-hours")}
            accessibilityRole="button"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={COLORS.blue}
            />

            <Text style={styles.secondaryButtonText}>
              Log another contribution
            </Text>
          </Pressable>

          <Pressable
            style={styles.homeButton}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
          >
            <Text style={styles.homeButtonText}>
              Return to Home
            </Text>
          </Pressable>
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
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  headerSpace: {
    width: 39,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 27,
    paddingBottom: 34,
  },

  hero: {
    alignItems: "center",
    marginBottom: 23,
  },

  successIcon: {
    width: 69,
    height: 69,
    borderRadius: 23,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 16,
  },

  pageDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  statusCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 15,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  statusIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  statusTextBlock: {
    flex: 1,
  },

  statusTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  statusDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  details: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 15,
    paddingTop: 13,
    gap: 12,
  },

  detailsHeading: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 1,
  },

  detailRow: {
    gap: 4,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 11,
    padding: 12,
    marginTop: 14,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: COLORS.darkBlue,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },

  noticeText: {
    color: COLORS.lightText,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  primaryButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.blue,
    borderRadius: 10,
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: "800",
  },

  homeButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 3,
  },

  homeButtonText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.75,
  },
});
