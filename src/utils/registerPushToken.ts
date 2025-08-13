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
    // Verifica se já existe token salvo
    const savedToken = await AsyncStorage.getItem("pushToken");
    if (savedToken) {
      console.log("Push token já existente no AsyncStorage:", savedToken);
      return savedToken;
    }

    // Solicita permissão
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permissão de notificação negada");
      return null;
    }

    // Obtém o push token do Expo
    const tokenObject = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenObject?.data || tokenObject; // compatível com diferentes versões

    if (!expoPushToken) {
      console.warn("Não foi possível obter o Expo Push Token.");
      return null;
    }

    // Salva localmente
    await AsyncStorage.setItem("pushToken", expoPushToken as string);
    console.log("Push token salvo no AsyncStorage:", expoPushToken);

    // Envia para o backend
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
      console.log("Resposta do backend ao enviar push token:", response.status, text);

      if (!response.ok) {
        console.error("Erro ao enviar push token para backend:", response.status, text);
      } else {
        console.log("Push token enviado para backend com sucesso");
      }
    }

    return expoPushToken;
  } catch (error) {
    console.error("Erro ao registrar push token:", error);
    return null;
  }
};
