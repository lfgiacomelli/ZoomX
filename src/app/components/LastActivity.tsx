import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

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
  const [data, setData] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const animationRef = useRef<LottieView | null>(null);

  const baseURL = "https://backend-turma-a-2025.onrender.com";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usuarioId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");
      if (!usuarioId) throw new Error("ID do usuário não encontrado");

      const response = await fetch(
        `${baseURL}/api/viagens/andamento/${usuarioId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        setData(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao carregar dados da última viagem");
      }

      const json = await response.json();

      if (json.sucesso && json.viagem) {
        setData(json.viagem);
        setError(null);
      } else {
        setData(null);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSolicitarNovamente = async () => {
    if (!data) {
      Alert.alert("Erro", "Nenhuma viagem disponível para solicitar.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");
      if (!userId || !token) {
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
          sol_servico: "Mototáxi",
          usu_codigo: Number(userId),
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
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={animationRef}
            source={loadingDataAnimation}
            autoPlay
            loop
            style={{ width: 230, height: 230 }}
          />
          <Text style={styles.loadingText}>Carregando sua última viagem...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Houve algum erro por aqui.</Text>
        </View>
      );
    }

    // Se não há dados e nem erro, não exibe nada
    if (!data) {
      return null;
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.screenTitle}>Última Viagem</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Origem:</Text>
            <Text style={styles.infoValue}>{data.via_origem}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Destino:</Text>
            <Text style={styles.infoValue}>{data.via_destino}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Valor:</Text>
            <Text style={styles.infoValue}>
              R$ {Number(data.via_valor).toFixed(2)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Pagamento:</Text>
            <Text style={styles.infoValue}>
              {data.via_formapagamento || "Dinheiro"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Serviço:</Text>
            <Text style={styles.infoValue}>{data.via_servico || "Mototáxi"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSolicitarNovamente}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Solicitar a última viagem novamente"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: "Righteous",
    color: "#000000",
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
    color: "#000000",
    opacity: 0.7,
  },
  infoValue: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000000",
  },
  button: {
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000000",
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
  },
});
