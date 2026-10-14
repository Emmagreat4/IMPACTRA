
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const NOTIFICATIONS_KEY = "impactra_notifications";

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
  paleGray: "#F1F3F7",
};

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  serverConfirmed: boolean;
};

function getString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseNotifications(raw: string | null): NotificationRecord[] {
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Saved notification data is invalid.");
  }

  const notifications: NotificationRecord[] = [];

  parsed.forEach((value: unknown, index: number) => {
    if (!isRecord(value)) return;

    const title = getString(value.title);
    const message = getString(
      value.message,
      value.body,
      value.description
    );

    // Do not display incomplete or invented notification content.
    if (!title || !message) return;

    const readValue = value.isRead ?? value.read;

    notifications.push({
      id:
        getString(value.id, value._id) ||
        `${getString(value.createdAt, value.date) || "record"}-${index}`,
      title,
      message,
      createdAt: getString(
        value.createdAt,
        value.timestamp,
        value.date
      ),
      isRead: readValue === true,
      type: getString(value.type, value.category),
      // Only an explicitly identified server record is treated
      // as server-confirmed.
      serverConfirmed:
        value.serverConfirmed === true ||
        value.source === "server",
    });
  });

  notifications.sort((a, b) => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);

    if (Number.isFinite(aTime) && Number.isFinite(bTime)) {
      return bTime - aTime;
    }

    if (Number.isFinite(aTime)) return -1;
    if (Number.isFinite(bTime)) return 1;

    return 0;
  });

  return notifications;
}

function formatDate(value: string): string {
  if (!value) return "Date not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not recorded";
  }

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationIcon(type: string) {
  const normalized = type.toLowerCase();

  if (normalized.includes("application")) {
    return "document-text-outline" as const;
  }

  if (
    normalized.includes("contribution") ||
    normalized.includes("hours") ||
    normalized.includes("verification")
  ) {
    return "time-outline" as const;
  }

  if (normalized.includes("certificate")) {
    return "ribbon-outline" as const;
  }

  return "notifications-outline" as const;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<
    NotificationRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const records = parseNotifications(saved);
      setNotifications(records);
    } catch (error) {
      console.error("Unable to load notifications:", error);
      setLoadError(
        "We couldn't read your saved notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const renderNotification = ({
    item,
  }: {
    item: NotificationRecord;
  }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationTopRow}>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={21}
            color={COLORS.blue}
          />
        </View>

        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>
            {item.title}
          </Text>

          <Text style={styles.notificationDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {!item.isRead ? (
          <View
            style={styles.unreadDot}
            accessibilityLabel="Unread notification"
          />
        ) : null}
      </View>

      <Text style={styles.notificationMessage}>
        {item.message}
      </Text>

      <View style={styles.sourceRow}>
        <Ionicons
          name={
            item.serverConfirmed
              ? "cloud-done-outline"
              : "phone-portrait-outline"
          }
          size={14}
          color={COLORS.muted}
        />

        <Text style={styles.sourceText}>
          {item.serverConfirmed
            ? "Identified as a service notification"
            : "Saved on this device"}
        </Text>
      </View>
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
          <Text style={styles.stateDescription}>
            Loading your notifications...
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
              size={30}
              color={COLORS.blue}
            />
          </View>

          <Text style={styles.stateTitle}>
            Unable to load notifications
          </Text>

          <Text style={styles.stateDescription}>
            {loadError}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => void loadNotifications()}
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
        <View style={styles.stateIcon}>
          <Ionicons
            name="notifications-outline"
            size={31}
            color={COLORS.blue}
          />
        </View>

        <Text style={styles.stateTitle}>
          No notifications yet
        </Text>

        <Text style={styles.stateDescription}>
          Genuine application updates and contribution review
          notifications will appear here when they are available.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color={COLORS.blue}
          />

          <Text style={styles.infoText}>
            Online notifications are not connected yet. This screen
            does not generate sample alerts or claim that an
            organization has sent an update.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/application-status")}
          accessibilityRole="button"
        >
          <Ionicons
            name="document-text-outline"
            size={17}
            color={COLORS.white}
          />
          <Text style={styles.primaryButtonText}>
            View application status
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/contribution-history")}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>
            View contribution history
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
            Notifications
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            onPress={() => void loadNotifications()}
            accessibilityRole="button"
            accessibilityLabel="Refresh notifications"
            disabled={loading}
            hitSlop={8}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={COLORS.blue}
            />
          </Pressable>
        </View>

        <FlatList
          data={loading || loadError ? [] : notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          ListHeaderComponent={
            <View style={styles.pageIntro}>
              <Text style={styles.pageTitle}>
                Your updates
              </Text>

              <Text style={styles.pageDescription}>
                Keep track of notifications available in IMPACTRA.
              </Text>

              {!loading && !loadError && notifications.length > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    {notifications.length}{" "}
                    {notifications.length === 1
                      ? "notification"
                      : "notifications"}
                  </Text>

                  <Text style={styles.summaryText}>
                    {unreadCount} unread
                  </Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void loadNotifications()}
              tintColor={COLORS.blue}
              colors={[COLORS.blue]}
            />
          }
        />
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
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 30,
  },

  pageIntro: {
    marginBottom: 17,
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
  },

  pageDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  summaryText: {
    color: COLORS.lightText,
    fontSize: 11,
    fontWeight: "700",
  },

  notificationCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
  },

  notificationTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  notificationIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationText: {
    flex: 1,
    minWidth: 0,
  },

  notificationTitle: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
  },

  notificationDate: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginTop: 5,
  },

  notificationMessage: {
    color: COLORS.lightText,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 11,
  },

  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 11,
    paddingTop: 9,
  },

  sourceText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  stateContainer: {
    flexGrow: 1,
    minHeight: 330,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 24,
  },

  stateIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: COLORS.paleBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  stateTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 16,
  },

  stateDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 8,
  },

  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.paleBlue,
    borderWidth: 1,
    borderColor: "#DCE8FF",
    borderRadius: 11,
    padding: 11,
    marginTop: 17,
  },

  infoText: {
    flex: 1,
    color: COLORS.darkBlue,
    fontSize: 10,
    lineHeight: 16,
  },

  primaryButton: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.blue,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 19,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 7,
  },

  secondaryButtonText: {
    color: COLORS.blue,
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },
});
