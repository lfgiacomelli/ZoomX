import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Tab from "@components/Tab";
import { useAuth } from "@contexts/useAuth";
import { useNotificationObserver } from "@hooks/useNotificationObserver";

const BASE_URL = "https://backend-turma-a-2025.onrender.com";

export default function AuthenticatedLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading } = useAuth();

  useNotificationObserver();

  const verificarBanimento = async () => {
    try {
      const id = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!id || !token) return;

      const res = await fetch(`${BASE_URL}/api/usuarios/${id}/banimento`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Erro na requisição de banimento:", res.status);
        return;
      }

      const json = await res.json();

      if (json.banido) {
        await AsyncStorage.clear();
        Alert.alert(
          "Você teve sua conta suspensa",
          "Acreditamos que você possa ter violado nossas políticas.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Erro ao verificar banimento:", error);
    }
  };

  useEffect(() => {

    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user && pathname === "/home") {
      verificarBanimento();
    }
  }, [loading, user, pathname]);

  if (loading || !user) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </GestureHandlerRootView>
    );
  }

  const hideTabRoutes = [
    "/RequestTravel",
    "/RequestMarket",
    "/RequestDelivery",
    "/PaymentPending",
    "/PendingRequest",
    "/Profile",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
