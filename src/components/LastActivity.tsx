import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

import { useAuth } from "@contexts/useAuth";
import loadingDataAnimation from "@animations/loading_data.json";

type Viagem = {
  via_codigo: number;
  via_data: string;
  via_servico: string;
  via_status: string;
  via_observacoes: string;
  via_origem: string;
  via_destino: string;
  via_valor: string;
  via_formapagamento: string;
  sol_distancia: number;
  usu_codigo: number;
};

export default function LastActivity() {
  const { user, token } = useAuth();
  const [data, setData] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const animationRef = useRef<LottieView | null>(null);

  const baseURL = "https://backend-turma-a-2025.onrender.com";

  const fetchData = useCallback(async () => {
    if (!user?.id || !token) {
      setError("ID ou token não encontrado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedData = await AsyncStorage.getItem("ultimaViagem");
      if (storedData) {
        const parsed: Viagem = JSON.parse(storedData);
        setData(parsed);
      }

      const response = await fetch(`${baseURL}/api/viagens/andamento/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setData(null);
        await AsyncStorage.removeItem("ultimaViagem");
        return;
      }

      const json = await response.json();

      if (json.sucesso && json.viagem) {
        const newData: Viagem = json.viagem;

        const currentData = await AsyncStorage.getItem("ultimaViagem");
        if (!currentData || currentData !== JSON.stringify(newData)) {
          setData(newData);
          await AsyncStorage.setItem("ultimaViagem", JSON.stringify(newData));
        }
      } else {
        setData(null);
        await AsyncStorage.removeItem("ultimaViagem");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSolicitarNovamente = useCallback(async () => {
    if (!data) {
      Alert.alert("Erro", "Nenhuma viagem disponível para solicitar.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user?.id || !token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const response = await fetch(`${baseURL}/api/solicitacoes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sol_origem: data.via_origem,
          sol_destino: data.via_destino,
          sol_distancia: Number(data.sol_distancia),
          sol_valor: Number(data.via_valor),
          sol_servico: data.via_servico || "Mototáxi",
          usu_codigo: Number(user.id),
          sol_data: new Date().toISOString(),
          sol_formapagamento: data.via_formapagamento || "Dinheiro",
          sol_observacoes: "Solicitado novamente via histórico do App",
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Erro ao criar solicitação");
      }

      router.push(`/PendingRequest?solicitacaoId=${json.sol_codigo}`);
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      Alert.alert("Erro", "Não foi possível criar a solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  }, [data, user?.id, token]);

  const renderContent = () => {
    if (loading) {
      return;
    }

    if (!data) {
      return;
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.screenTitle}>Última Viagem</Text>

        <View style={styles.infoContainer}>
          <InfoItem label="Origem:" value={data.via_origem} />
          <InfoItem label="Destino:" value={data.via_destino} />
          <InfoItem label="Valor:" value={`R$ ${Number(data.via_valor).toFixed(2)}`} />
          <InfoItem label="Pagamento:" value={data.via_formapagamento || "Dinheiro"} />
          <InfoItem label="Serviço:" value={data.via_servico || "Mototáxi"} />
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSolicitarNovamente}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Solicitar Novamente</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Righteous",
    color: "#000",
    marginBottom: 24,
    textAlign: "left",
  },
  contentContainer: {
    marginTop: 16,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  infoLabel: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    opacity: 0.7,
  },
  infoValue: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  errorText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
  },
});
