
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const DRAFTS_KEY = "impactra_application_drafts";

const COLORS = {
  blue: "#155EEF",
  darkBlue: "#123B70",
  background: "#F7F9FD",
  paleBlue: "#EFF5FF",
  border: "#E5EBF4",
  text: "#172B4D",
  muted: "#7B8798",
  white: "#FFFFFF",
  error: "#C62828",
};

type Draft = {
  opportunityId: string;
  title: string;
  organization: string;
  fullName: string;
  email: string;
  phone: string;
  motivation: string;
  savedAt: string;
};

function getParam(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readDrafts(raw: string | null): Draft[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved draft data is invalid.");
  }

  return parsed.filter(
    (item): item is Draft =>
      !!item &&
      typeof item === "object" &&
      typeof item.opportunityId === "string" &&
      typeof item.title === "string" &&
      typeof item.email === "string",
  );
}

export default function ApplicationFormScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    organization?: string | string[];
  }>();

  const opportunityId = getParam(params.id);
  const opportunityTitle = getParam(params.title);
  const organization = getParam(params.organization);

  const hasOpportunity = Boolean(
    opportunityId.trim() && opportunityTitle.trim(),
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/opportunities");
    }
  };

  const saveDraft = async () => {
    setError("");

    if (!hasOpportunity) {
      setError(
        "The selected opportunity details are missing. Return to Discover and open a valid listing.",
      );
      return;
    }

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !motivation.trim()
    ) {
      setError("Complete all required fields before saving your draft.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (phone.trim().replace(/[^\d+]/g, "").length < 7) {
      setError("Enter a valid contact phone number.");
      return;
    }

    try {
      setSaving(true);

      const existingRaw = await AsyncStorage.getItem(DRAFTS_KEY);
      const existingDrafts = readDrafts(existingRaw);

      const draft: Draft = {
        opportunityId,
        title: opportunityTitle,
        organization,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        motivation: motivation.trim(),
        savedAt: new Date().toISOString(),
      };

      const updatedDrafts = [
        ...existingDrafts.filter(
          (item) => item.opportunityId !== opportunityId,
        ),
        draft,
      ];

      await AsyncStorage.setItem(
        DRAFTS_KEY,
        JSON.stringify(updatedDrafts),
      );

      Alert.alert(
        "Draft saved on this device",
        "Your application draft has been saved locally. It has NOT been submitted to the organization. Online submission is unavailable until the real application service is connected.",
        [{ text: "OK" }],
      );
    } catch (saveError) {
      console.error("Unable to save application draft:", saveError);

      setError(
        "Your draft could not be saved. Check device storage and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={goBack}
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
            Application Form
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!hasOpportunity ? (
            <View style={styles.noticeCard}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color={COLORS.error}
              />

              <Text style={styles.noticeTitle}>
                No opportunity selected
              </Text>

              <Text style={styles.noticeText}>
                Return to Discover and open a genuine opportunity
                before starting an application.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={() => router.replace("/opportunities")}
              >
                <Text style={styles.primaryButtonText}>
                  Back to Discover
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.intro}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color={COLORS.blue}
                  />
                </View>

                <Text style={styles.pageTitle}>
                  Apply for an opportunity
                </Text>

                <Text style={styles.pageSubtitle}>
                  Review the selected listing and provide your details.
                </Text>
              </View>

              <View style={styles.opportunityCard}>
                <Text style={styles.overline}>
                  SELECTED OPPORTUNITY
                </Text>

                <Text style={styles.opportunityTitle}>
                  {opportunityTitle}
                </Text>

                {organization ? (
                  <Text style={styles.organization}>
                    {organization}
                  </Text>
                ) : null}
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  Your details
                </Text>

                <Text style={styles.fieldLabel}>
                  Full name *
                </Text>

                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#96A2B3"
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  accessibilityLabel="Full name"
                />

                <Text style={styles.fieldLabel}>
                  Email address *
                </Text>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#96A2B3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Email address"
                />

                <Text style={styles.fieldLabel}>
                  Phone number *
                </Text>

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your contact number"
                  placeholderTextColor="#96A2B3"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  returnKeyType="next"
                  accessibilityLabel="Phone number"
                />

                <Text style={styles.fieldLabel}>
                  Why are you interested? *
                </Text>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={motivation}
                  onChangeText={setMotivation}
                  placeholder="Describe your interest and what you hope to contribute."
                  placeholderTextColor="#96A2B3"
                  multiline
                  textAlignVertical="top"
                  maxLength={1500}
                  accessibilityLabel="Reason for applying"
                />

                <Text style={styles.characterCount}>
                  {motivation.length}/1500
                </Text>
              </View>

              <View style={styles.privacyNotice}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={COLORS.blue}
                />

                <View style={styles.privacyTextBlock}>
                  <Text style={styles.privacyTitle}>
                    Your information
                  </Text>

                  <Text style={styles.privacyText}>
                    Saving this draft stores the information on this
                    device. It does not send your personal details to
                    the organization or submit an application.
                  </Text>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={19}
                    color={COLORS.error}
                  />

                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  saving && styles.disabledButton,
                  pressed && styles.pressed,
                ]}
                onPress={saveDraft}
                disabled={saving}
                accessibilityRole="button"
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Ionicons
                    name="save-outline"
                    size={19}
                    color={COLORS.white}
                  />
                )}

                <Text style={styles.primaryButtonText}>
                  {saving ? "Saving draft..." : "Save draft on this device"}
                </Text>
              </Pressable>

              <Text style={styles.footerNote}>
                Online application submission and confirmation will
                only be enabled after a real application endpoint is
                connected. No application will be marked as submitted
                by this screen.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.paleBlue,
  },

  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  headerSpace: {
    width: 39,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 36,
  },

  intro: {
    alignItems: "center",
    marginBottom: 19,
  },

  heroIcon: {
    width: 57,
    height: 57,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.paleBlue,
  },

  pageTitle: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  pageSubtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  opportunityCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 14,
    marginBottom: 22,
  },

  overline: {
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  opportunityTitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
    marginTop: 7,
  },

  organization: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
  },

  fieldLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },

  textArea: {
    minHeight: 115,
    paddingTop: 12,
  },

  characterCount: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
  },

  privacyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginTop: 16,
    backgroundColor: COLORS.paleBlue,
    borderRadius: 12,
  },

  privacyTextBlock: {
    flex: 1,
  },

  privacyTitle: {
    color: COLORS.darkBlue,
    fontSize: 12,
    fontWeight: "800",
  },

  privacyText: {
    color: COLORS.darkBlue,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    backgroundColor: "#FFF1F0",
    borderRadius: 10,
    marginTop: 14,
  },

  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 17,
  },

  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    borderRadius: 11,
    backgroundColor: COLORS.blue,
    marginTop: 18,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.75,
  },

  footerNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
  },

  noticeCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 22,
    marginTop: 32,
  },

  noticeTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },

  noticeText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
});
