import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Stack, useRouter } from "expo-router";


export default function AuthenticatedLayout() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
