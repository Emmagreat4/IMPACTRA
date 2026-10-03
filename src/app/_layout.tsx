import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="home" />
      <Stack.Screen name="opportunities" />
      <Stack.Screen name="opportunity-details" />
      <Stack.Screen name="application-status" />
      <Stack.Screen name="log-hours" />
      <Stack.Screen name="contribution-history" />
      <Stack.Screen name="certificate" />
      <Stack.Screen name="my-profile" />
    </Stack>
  );
}