import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Pressable,
    ToastAndroid,
    Platform,
    BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";

import Header from "@components/Header";

export default function PaymentPending() {
    const params = useLocalSearchParams();
    const { paymentId, solicitacaoId } = params;
    const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
    const [loading, setLoading] = useState(true);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [pixCopy, setPixCopy] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300);
    const router = useRouter();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const backAction = () => {
            if (status === "pending") {
                ToastAndroid.showWithGravity(
                    "Finalize o pagamento ou aguarde.",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );

                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [status]);

    const createSolicitacaoAfterPayment = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
                "https://backend-turma-a-2025.onrender.com/api/solicitacoes/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        sol_origem: params.startAddress,
                        sol_destino: params.endAddress,
                        sol_distancia: params.distance,
                        sol_valor: params.price,
                        sol_servico: "Mototáxi",
                        usu_codigo: params.userId,
                        sol_data: new Date().toISOString(),
                        sol_formapagamento: params.formaPagamento,
                        sol_observacoes: "Pedido via App (PIX)",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao criar solicitação após pagamento.");
            }

            return data.sol_codigo;
        } catch (error) {
            console.error("Erro ao criar solicitação após pagamento:", error);
            throw error;
        }
    };

    useEffect(() => {
        if (!paymentId) return;

        let interval: NodeJS.Timeout;
        let timeout: NodeJS.Timeout;

        const fetchStatus = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch(
                    `https://backend-turma-a-2025.onrender.com/api/payments/status/${paymentId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    console.error("Erro ao buscar status:", data);
                    return;
                }

                setStatus(data.status);
                setLoading(false);

                setQrCodeBase64(data.qr_code_base64 ?? null);
                setPixCopy(data.qr_code ?? null);

                if (data.status === "approved") {
                    clearInterval(interval);
                    clearTimeout(timeout);

                    try {
                        if (params.shouldCreateSolicitacao === "true") {
                            const newSolicitacaoId = await createSolicitacaoAfterPayment();
                            router.push(`/PendingRequest?solicitacaoId=${newSolicitacaoId}`);
                        } else {
                            router.push(`/PendingRequest?solicitacaoId=${solicitacaoId}`);
                        }
                    } catch (error) {
                        Alert.alert(
                            "Erro",
                            "Pagamento aprovado, mas não foi possível criar a solicitação.",
                            [{ text: "OK", onPress: () => router.back() }]
                        );
                    }
                } else if (data.status === "rejected") {
                    clearInterval(interval);
                    clearTimeout(timeout);
                    Alert.alert(
                        "Pagamento rejeitado",
                        "Tente novamente com outro método.",
                        [{ text: "OK", onPress: () => router.back() }]
                    );
                }
            } catch (error) {
                console.error("Erro ao consultar pagamento:", error);
            }
        };

        const countdown = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timeout = setTimeout(() => {
            handleTimeout();
        }, 300000);

        fetchStatus();
        interval = setInterval(fetchStatus, 5000);

        const handleTimeout = () => {
            clearInterval(interval);
            Alert.alert(
                "Tempo esgotado",
                "O tempo para realizar o pagamento PIX expirou. Por favor, inicie um novo pagamento.",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    }
                ]
            );
        };

        return () => {
            clearInterval(interval);
            clearInterval(countdown);
            clearTimeout(timeout);
        };
    }, [paymentId]);

    const handleCopyPix = useCallback(async () => {
        if (!pixCopy) return;

        if (Platform.OS !== "ios" && Platform.OS !== "android") {
            Alert.alert("Aviso", "Copiar código PIX está disponível apenas em dispositivos móveis.");
            return;
        }

        try {
            if (Platform.OS === "ios") {
                await Clipboard.setStringAsync(pixCopy);
                Alert.alert("Sucesso", "Código PIX copiado para a área de transferência!");
            } else {
                await Clipboard.setStringAsync(pixCopy);
                ToastAndroid.show("Código PIX copiado!", ToastAndroid.SHORT);
            }
        } catch (err) {
            console.error("Erro ao copiar PIX:", err);
            Alert.alert("Erro", "Não foi possível copiar o código PIX.");
        }
    }, [pixCopy]);

    return (
        <>
            <Header disableNavigation />
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Pagamento via PIX</Text>

                    <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>Tempo restante:</Text>
                        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#000" />
                            <Text style={styles.loadingText}>Carregando informações de pagamento...</Text>
                        </View>
                    ) : qrCodeBase64 ? (
                        <>
                            <View style={styles.qrCodeContainer}>
                                <Image
                                    source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
                                    style={styles.qrCode}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text style={styles.instructions}>
                                Escaneie o QR Code acima ou copie o código abaixo para realizar o pagamento
                            </Text>

                            {pixCopy && (
                                <Pressable
                                    onPress={handleCopyPix}
                                    style={({ pressed }) => [
                                        styles.copyContainer,
                                        pressed && styles.copyContainerPressed
                                    ]}
                                >
                                    <Text selectable style={styles.pixText}>
                                        {pixCopy}
                                    </Text>
                                    <Text style={styles.copyText}>Toque para copiar o código PIX</Text>
                                </Pressable>
                            )}

                            <View style={styles.statusContainer}>
                                <Text style={styles.statusLabel}>Status do pagamento:</Text>
                                <Text style={[
                                    styles.statusValue,
                                    status === 'pending' && styles.statusPending,
                                    status === 'approved' && styles.statusApproved,
                                    status === 'rejected' && styles.statusRejected
                                ]}>
                                    {status === 'pending' ? 'Pendente' :
                                        status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Nenhum QR Code disponível</Text>
                            <Text style={styles.errorSubtext}>Por favor, tente novamente mais tarde</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0"
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontFamily: "Righteous",
        color: "#000",
        marginBottom: 16,
        textAlign: "center"
    },
    timerContainer: {
        backgroundColor: "#000",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 24,
        flexDirection: "row",
        alignItems: "center"
    },
    timerText: {
        color: "#fff",
        fontFamily: "Righteous",
        fontSize: 14,
        marginRight: 8
    },
    timer: {
        color: "#fff",
        fontFamily: "Righteous",
        fontSize: 18,
    },
    qrCodeContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20
    },
    qrCode: {
        width: 220,
        height: 220
    },
    instructions: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: "80%",
        lineHeight: 20
    },
    pixText: {
        fontSize: 14,
        fontFamily: Platform.OS === "android" ? "monospace" : "Courier New",
        marginBottom: 8,
        textAlign: "center",
        color: "#000",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd"
    },
    copyText: {
        fontSize: 12,
        color: "#0066cc",
        textDecorationLine: "underline",
        textAlign: "center",
        fontFamily: "Righteous"
    },
    copyContainer: {
        marginBottom: 24,
        paddingHorizontal: 10,
        alignItems: "center"
    },
    copyContainerPressed: {
        opacity: 0.7
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16
    },
    statusLabel: {
        fontFamily: "Righteous",
        color: "#555",
        fontSize: 14,
        marginRight: 8
    },
    statusValue: {
        fontFamily: "Righteous",
        fontSize: 16,
    },
    statusPending: {
        color: "#FFA500"
    },
    statusApproved: {
        color: "#008000"
    },
    statusRejected: {
        color: "#FF0000"
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40
    },
    loadingText: {
        marginTop: 16,
        fontFamily: "Righteous",
        color: "#555",
        textAlign: "center"
    },
    errorContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40
    },
    errorText: {
        fontFamily: "Righteous",
        color: "#FF0000",
        fontSize: 16,
        marginBottom: 8
    },
    errorSubtext: {
        fontFamily: "Righteous",
        color: "#555",
        fontSize: 14,
        textAlign: "center"
    }
});