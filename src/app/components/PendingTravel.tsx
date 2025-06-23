import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Viagem = {
  via_codigo: number;
  via_origem: string;
  via_destino: string;
  via_data: string;
  via_status: string;
  via_valor?: string;
  via_formapagamento?: string;
  via_servico?: string;
  fun_nome?: string;
  mot_placa?: string;
  mot_modelo?: string;
  sol_codigo: number;
};

const ProgressBar = ({ duration = 3000 }: { duration?: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);

    const animation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        delay: 0,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [duration, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
    </View>
  );
};

export default function PendingTravel() {
  const router = useRouter();
  const [data, setData] = useState<Viagem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const baseURL = "https://backend-turma-a-2025.onrender.com";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (!response.ok)
        throw new Error(`Erro de API: ${response.status} ${response.statusText}`);

      const json = await response.json();

      if (json.sucesso && json.viagem) {
        setData(json.viagem);
      } else {
        setData(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error("Erro:", err.message);
      } else {
        setError("Erro ao carregar dados");
        console.error("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInfoFuncionario = async (solicitacaoId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${baseURL}/api/viagens/solicitacao/${solicitacaoId}/funcionario`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar funcionário: ${response.status} ${response.statusText}`
        );
      }

      const json = await response.json();

      if (json.sucesso && json.funcionario) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                fun_nome: json.funcionario.fun_nome,
                mot_modelo: json.funcionario.mot_modelo,
                mot_placa: json.funcionario.mot_placa,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Erro ao buscar informações do funcionário:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data?.sol_codigo && data.via_status === "em andamento") {
      fetchInfoFuncionario(data.sol_codigo);
    }
  }, [data]);

  if (loading) {
    return (
      <View />
        
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchData}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || data.via_status !== "em andamento") {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIAGEM EM ANDAMENTO</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.activeDot} />
          <Text style={styles.statusText}>ATIVO</Text>
        </View>
      </View>

      <View style={styles.card}>
        <ProgressBar duration={3500} />

        <View style={styles.infoContainer}>
          <InfoRow label="Origem" value={data.via_origem} />
          <InfoRow label="Destino" value={data.via_destino} />
          <InfoRow label="Status" value={data.via_status.toUpperCase()} isStatus />
          
          <View style={styles.divider} />
          
          <InfoRow label="Mototaxista" value={data.fun_nome || "---"} />
          <InfoRow label="Modelo" value={data.mot_modelo || "---"} />
          <InfoRow label="Placa" value={data.mot_placa || "---"} />
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/TravelDetails/${data.via_codigo}`)}
          style={styles.detailsButton}
          accessibilityRole="button"
          accessibilityLabel="Ver detalhes da viagem"
        >
          <Text style={styles.detailsButtonText}>VER DETALHES COMPLETOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const InfoRow = ({
  label,
  value,
  isStatus = false,
}: {
  label: string;
  value: string;
  isStatus?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text 
      style={[
        styles.value, 
        isStatus && styles.statusValue,
        value === "---" && styles.unavailableValue
      ]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontFamily: "Righteous",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFA000",
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Righteous",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#212121",
    letterSpacing: 0.8,
    fontWeight: "500",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  statusText: {
    fontFamily: "Righteous",
    fontSize: 12,
    color: "#4CAF50",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBarContainer: {
    height: 4,
    width: "100%",
    backgroundColor: "#F5F5F5",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFA000",
  },
  infoContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  label: {
    fontFamily: "Righteous",
    color: "#757575",
    fontSize: 13,
    letterSpacing: 0.4,
    flex: 1,
  },
  value: {
    fontFamily: "Righteous",
    color: "#212121",
    fontSize: 14,
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },
  statusValue: {
    color: "#FFA000",
    fontWeight: "500",
  },
  unavailableValue: {
    color: "#9E9E9E",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  detailsButton: {
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  detailsButtonText: {
    color: "#FFA000",
    fontFamily: "Righteous",
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: "center",
    fontWeight: "500",
  },
});