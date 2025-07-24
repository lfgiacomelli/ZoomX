import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, usePathname, useRouter } from "expo-router";
import Tab from "@components/Tab";
import { useAuth } from "@contexts/useAuth";

import Toast from "react-native-toast-message";

export default function AuthenticatedLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  if (loading || !user) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </GestureHandlerRootView>
    );
  }

  const hideTabRoutes = ["/RequestTravel", "/RequestMarket", "/RequestDelivery", "/PaymentPending", "/PendingRequest", "/Profile"];
  const shouldShowTab = !hideTabRoutes.includes(pathname);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
      </View>
      {shouldShowTab && <Tab />}
      <Toast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  stackContainer: { flex: 1 },
});
