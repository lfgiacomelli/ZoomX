import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Stack, usePathname, useRouter } from "expo-router";
import Tab from "@components/Tab";

export default function AuthenticatedLayout() {
  const router = useRouter();
  const pathname = usePathname();

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
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  const hideTabRoutes = [
    "/RequestTravel",
    "/RequestMarket",
    "/RequestDelivery",
    "/PaymentPending",
    "/PendingRequest"
  
  ];

  const shouldShowTab = !hideTabRoutes.includes(pathname);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.stackContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            gestureEnabled: false,
          }}
        />
      </View>

      {shouldShowTab && <Tab />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    flex: 1,
  },
});
