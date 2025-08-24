import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@contexts/useAuth";

interface ViagemResponse {
    sucesso: boolean;
    viagem?: {
        via_codigo: number;
        via_status: string;
    };
    mensagem?: string;
}

export default function VerificarAndamento() {
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const { user } = useAuth();

    // Configura permissões e handler de notificações
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== "granted") {
                    Alert.alert(
                        "Permissão necessária",
                        "Ative as notificações para receber alertas de viagem."
                    );
                }
            }

            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });
        })();
    }, []);

    useEffect(() => {
        if (user?.id) {
            setUsuarioId(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (!usuarioId) return;

        async function verificarStatus() {
            try {
                const response = await fetch(
                    `https://backend-turma-a-2025.onrender.com/api/viagens/andamento/${usuarioId}`
                );

                if (!response.ok) {
                    console.error("Erro ao buscar status da viagem:", response.status);
                    return;
                }

                const data: ViagemResponse = await response.json();

                if (!data.sucesso || !data.viagem) {
                    return;
                }

                const { via_codigo, via_status } = data.viagem;
                const codigoString = String(via_codigo);

                if (via_status.toLowerCase() === "finalizada") {
                    const ultimaNotificada = await AsyncStorage.getItem("ultimaViagemNotificada");

                    if (ultimaNotificada !== codigoString) {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Viagem finalizada!",
                                body: "Sua viagem foi finalizada. Por favor, avalie a corrida para nos ajudar a melhorar.",
                                data: {
                                    viagemId: via_codigo,
                                    url: `/AvaliarViagem/${via_codigo}`
                                },
                                sound: "default",
                            },
                            trigger: null,
                        });


                        await AsyncStorage.setItem("ultimaViagemNotificada", codigoString);
                    }
                }
            } catch (error) {
                console.error("Erro na verificação do status da viagem:", error);
            }
        }

        verificarStatus();
        const intervalo = setInterval(verificarStatus, 30000);

        return () => clearInterval(intervalo);
    }, [usuarioId]);

    return null;
}
