import React, { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ViagemResponse {
    sucesso: boolean;
    viagem?: {
        via_codigo: string;
        via_status: string;
    };
    mensagem?: string;
}

export default function VerificarAndamento() {
    const [usuarioId, setUsuarioId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== "granted") {
                    Alert.alert("Permissão necessária", "Ative as notificações para receber alertas de viagem.");
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

    // Pegar ID do usuário
    useEffect(() => {
        async function pegarUsuarioId() {
            try {
                const id = await AsyncStorage.getItem("id");
                if (id) setUsuarioId(id);
            } catch (error) {
                console.error("Erro ao acessar AsyncStorage:", error);
            }
        }
        pegarUsuarioId();
    }, []);

    // Verificar status da viagem e notificar apenas uma vez por viagem
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
                    console.log(data.mensagem || "Nenhuma viagem encontrada");
                    return;
                }

                const { via_codigo, via_status } = data.viagem;

                if (via_status.toLowerCase() === 'finalizada') {
                    const ultimaNotificada = await AsyncStorage.getItem("ultimaViagemNotificada");

                    if (ultimaNotificada !== via_codigo) {
                        // Envia a notificação
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Viagem finalizada!",
                                body: "Sua viagem foi finalizada. Por favor, avalie a corrida para nos ajudar a melhorar.",
                                data: { viagemId: via_codigo },
                                sound: 'default',
                            },
                            trigger: null,
                        });

                        console.log("Notificação enviada para viagem:", via_codigo);

                        // Salva ID da última notificada
                        await AsyncStorage.setItem("ultimaViagemNotificada", via_codigo);
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
