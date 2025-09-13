import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { AuthProvider } from "@contexts/useAuth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function Layout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFFFFF",
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
