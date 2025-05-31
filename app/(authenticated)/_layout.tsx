import { Redirect, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
export default function AuthenticatedLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const id = await AsyncStorage.getItem("id");
      setIsAuthenticated(!!id);
    };
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isAuthenticated === null ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              gestureEnabled: false,
            }}
          />
          <Toast />
        </>
      )}
    </GestureHandlerRootView>
  );
}
