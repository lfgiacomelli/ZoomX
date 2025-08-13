// pushToken.ts
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://backend-turma-a-2025.onrender.com";

export const registerPushToken = async (user: any, token: string) => {
    try {
        const savedToken = await AsyncStorage.getItem("pushToken");
        if (savedToken) return savedToken;

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            console.log("Permissão de notificação negada");
            return null;
        }

        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
        if (!expoPushToken) {
            console.warn("Não foi possível obter o Expo Push Token.");
            return null;
        }

        await AsyncStorage.setItem("pushToken", expoPushToken);
        console.log("Push token salvo no AsyncStorage:", expoPushToken);

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
            
            if (!response.ok) {
                console.error("Erro ao enviar push token para backend:", response.status);
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
