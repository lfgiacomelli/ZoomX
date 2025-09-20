import React, { useEffect, useState, useCallback, useRef } from "react";
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
import ToastMessage from "@components/ToastMessage";

type PaymentStatus = "pending" | "approved" | "rejected";

export default function PaymentPending() {
    const params = useLocalSearchParams() as {
        paymentId?: string;
        solicitacaoId?: string;
        shouldCreateSolicitacao?: string;
        startAddress?: string;
        endAddress?: string;
        distance?: string;
        price?: string;
        userId?: string;
        formaPagamento?: string;
    };

    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const [showToastPayment, setShowToastPayment] = useState(false);
    const [showToastExpired, setShowToastExpired] = useState(false);
    const [showToastError, setShowToastError] = useState(false);
    const [status, setStatus] = useState<PaymentStatus>("pending");
    const [loading, setLoading] = useState(true);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [pixCopy, setPixCopy] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const showMessage = useCallback((message: string) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
        }
    }, []);

    const createSolicitacaoAfterPayment = useCallback(async () => {
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
    }, [
        params.startAddress,
        params.endAddress,
        params.distance,
        params.price,
        params.userId,
        params.formaPagamento,
    ]);

    const handleTimeout = useCallback(() => {
        clearAllTimers();
        setShowToastExpired(true);
    }, [router]);

    const clearAllTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            if (!params.paymentId) return;

            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
                `https://backend-turma-a-2025.onrender.com/api/payments/status/${params.paymentId}`,
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
                clearAllTimers();

                try {
                    if (params.shouldCreateSolicitacao === "true") {
                        const newSolicitacaoId = await createSolicitacaoAfterPayment();
                        router.push(`/PendingRequest?solicitacaoId=${newSolicitacaoId}`);
                    } else if (params.solicitacaoId) {
                        router.push(`/PendingRequest?solicitacaoId=${params.solicitacaoId}`);
                    } else {
                        router.back();
                    }
                } catch (error) {
                    showMessage("Erro ao criar solicitação após pagamento.");
                    setTimeout(() => {
                        router.back();
                    }, 3000);
                }
            } else if (data.status === "rejected") {
                clearAllTimers();
                showMessage("Pagamento rejeitado. Por favor, tente novamente.");
                setTimeout(() => {
                    router.back();
                }, 3000);
            }
        } catch (error) {
            console.error("Erro ao consultar pagamento:", error);
        }
    }, [
        params.paymentId,
        params.shouldCreateSolicitacao,
        params.solicitacaoId,
        createSolicitacaoAfterPayment,
        router,
        showMessage,
        clearAllTimers,
    ]);

    useEffect(() => {
        const backAction = () => {
            if (status === "pending") {
                setShowToastPayment(true);
                setTimeout(() => setShowToastPayment(false), 2000); // <- Adicionado!
                return true;
            }

            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [status]);


    useEffect(() => {
        if (!params.paymentId) return;

        countdownRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (countdownRef.current) {
                        clearInterval(countdownRef.current);
                        countdownRef.current = null;
                    }
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timeoutRef.current = setTimeout(() => {
            handleTimeout();
        }, 300000);

        fetchStatus();
        intervalRef.current = setInterval(fetchStatus, 5000);

        return () => {
            clearAllTimers();
        };
    }, [fetchStatus, handleTimeout, params.paymentId, clearAllTimers]);

    const handleCopyPix = useCallback(async () => {
        if (!pixCopy) return;

        try {
            await Clipboard.setStringAsync(pixCopy);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            console.error("Erro ao copiar PIX:", err);
            setShowToastError(true);
            setTimeout(() => setShowToastError(false), 2000);
        }
    }, [pixCopy]);
    return (
        <>
            <Header disableNavigation />
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Pagamento via PIX</Text>

                    <Text style={styles.title}>
                        {params.price ? `R$ ${parseFloat(params.price).toFixed(2)}` : "R$ 0,00"}
                    </Text>

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
                                        pressed && styles.copyContainerPressed,
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
                                <Text
                                    style={[
                                        styles.statusValue,
                                        status === "pending" && styles.statusPending,
                                        status === "approved" && styles.statusApproved,
                                        status === "rejected" && styles.statusRejected,
                                    ]}
                                >
                                    {status === "pending"
                                        ? "Pendente"
                                        : status === "approved"
                                            ? "Aprovado"
                                            : "Rejeitado"}
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
            {showToast && <ToastMessage message="Código PIX copiado!" status="SUCCESS" onHide={() => setShowToast(false)} />}
            {showToastPayment && <ToastMessage message="Finalize o pagamento ou aguarde." status="DEFAULT" onHide={() => setShowToastPayment(false)} />}
            {showToastError && (
                <ToastMessage message="Erro ao copiar o código PIX." status="ERROR" onHide={() => setShowToastError(false)} />
            )}
            {showToastExpired && (
                <ToastMessage
                    message="O tempo para realizar o pagamento PIX expirou. Por favor, inicie um novo pagamento."
                    status="ERROR"
                    onHide={() => {
                        setShowToastExpired(false);
                        router.back();
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
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
        textAlign: "center",
    },
    timerContainer: {
        backgroundColor: "#000",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    timerText: {
        color: "#fff",
        fontFamily: "Righteous",
        fontSize: 14,
        marginRight: 8,
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
        marginBottom: 20,
    },
    qrCode: {
        width: 220,
        height: 220,
    },
    instructions: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: "80%",
        lineHeight: 20,
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
        borderColor: "#ddd",
    },
    copyText: {
        fontSize: 12,
        color: "#0066cc",
        textDecorationLine: "underline",
        textAlign: "center",
        fontFamily: "Righteous",
    },
    copyContainer: {
        marginBottom: 24,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    copyContainerPressed: {
        opacity: 0.7,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    statusLabel: {
        fontFamily: "Righteous",
        color: "#555",
        fontSize: 14,
        marginRight: 8,
    },
    statusValue: {
        fontFamily: "Righteous",
        fontSize: 16,
    },
    statusPending: {
        color: "#FFA500",
    },
    statusApproved: {
        color: "#008000",
    },
    statusRejected: {
        color: "#FF0000",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontFamily: "Righteous",
        color: "#555",
        textAlign: "center",
    },
    errorContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    errorText: {
        fontFamily: "Righteous",
        color: "#FF0000",
        fontSize: 16,
        marginBottom: 8,
    },
    errorSubtext: {
        fontFamily: "Righteous",
        color: "#555",
        fontSize: 14,
        textAlign: "center",
    },
});
