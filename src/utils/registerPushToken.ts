// pushToken.ts
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://backend-turma-a-2025.onrender.com";

/**
 * Registra o push token do usuário:
 * - Pede permissão de notificações
 * - Obtém o Expo Push Token
 * - Salva no AsyncStorage
 * - Envia para o backend
 *
 * @param user Usuário logado (deve ter user.id)
 * @param token Token JWT de autenticação
 * @returns Expo Push Token ou null
 */
export const registerPushToken = async (user: any, token: string) => {
  try {
    const savedToken = await AsyncStorage.getItem("pushToken");
    if (savedToken) {
      return savedToken;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const tokenObject = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenObject?.data || tokenObject; 

    if (!expoPushToken) {
      console.warn("Não foi possível obter o Expo Push Token.");
      return null;
    }

    await AsyncStorage.setItem("pushToken", expoPushToken as string);

    if (user?.id && token) {
      const url = `${API_BASE_URL}/api/usuarios/${user.id}/push-token`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pushToken: expoPushToken }),
      });

      const text = await response.text();

      if (!response.ok) {
        console.error("Erro ao enviar push token para backend:", response.status, text);
      } else {
        return;
      }
    }

    return expoPushToken;
  } catch (error) {
    console.error("Erro ao registrar push token:", error);
    return null;
  }
};
