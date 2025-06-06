import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

export default function AuthenticatedLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token"); // Pega o token JWT
      
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
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

  if (!isAuthenticated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      />
      <Toast />
    </GestureHandlerRootView>
  );
}
