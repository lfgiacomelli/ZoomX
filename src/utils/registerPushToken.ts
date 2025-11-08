// pushToken.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://backend-turma-a-2025.onrender.com";

export const registerPushToken = async (user: any, token: string) => {
  try {
    // Verifica se o token já foi salvo localmente
    const savedToken = await AsyncStorage.getItem("pushToken");
    if (savedToken) return savedToken;

    // Verifica se está em dispositivo físico
    if (!Device.isDevice) {
      console.warn("Notificações push só funcionam em dispositivos físicos.");
      return null;
    }

    // Pede permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Permissão de notificação não concedida.");
      return null;
    }

    // 👉 Importante: definir projectId do seu app no Expo (pego do app.json / eas.json)
    const tokenObject = await Notifications.getExpoPushTokenAsync({
      projectId: "SEU_PROJECT_ID_DO_EXPO_AQUI"
    });

    const expoPushToken = tokenObject.data;
    if (!expoPushToken) {
      console.warn("Não foi possível obter o Expo Push Token.");
      return null;
    }

    // Salva localmente
    await AsyncStorage.setItem("pushToken", expoPushToken);

    // Envia para o backend
    if (user?.id && token) {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${user.id}/push-token`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pushToken: expoPushToken }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Erro ao enviar push token para backend:", response.status, text);
      }
    }

    return expoPushToken;
  } catch (error) {
    console.error("Erro ao registrar push token:", error);
    return null;
  }
};
