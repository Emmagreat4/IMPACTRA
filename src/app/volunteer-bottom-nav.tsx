import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";

type NavItem = {
  label: string;
  route: string;
  icon: string;
};

const items: NavItem[] = [
  {
    label: "Home",
    route: "/home",
    icon: "⌂",
  },
  {
    label: "Opportunities",
    route: "/opportunities",
    icon: "⌕",
  },
  {
    label: "Contributions",
    route: "/contribution-history",
    icon: "◫",
  },
  {
    label: "Profile",
    route: "/my-profile",
    icon: "○",
  },
];

export default function VolunteerBottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === "/home") {
      return pathname === "/home";
    }

    return pathname === route;
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = isActive(item.route);

        return (
          <Pressable
            key={item.route}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace(item.route)}
          >
            <View
              style={[
                styles.iconContainer,
                active && styles.iconContainerActive,
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  active && styles.iconActive,
                ]}
              >
                {item.icon}
              </Text>
            </View>

            <Text
              style={[
                styles.label,
                active && styles.labelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E1E7ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingBottom: 5,
  },

  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 62,
  },

  iconContainer: {
    width: 34,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  iconContainerActive: {
    backgroundColor: "#EAF2FF",
  },

  icon: {
    fontSize: 21,
    color: "#8A949F",
  },

  iconActive: {
    color: "#0958D9",
  },

  label: {
    marginTop: 3,
    fontSize: 10,
    color: "#8A949F",
  },

  labelActive: {
    color: "#0958D9",
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },
});