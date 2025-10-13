import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@contexts/useAuth";

type Viagem = {
  via_codigo: number;
  via_origem: string;
  via_destino: string;
  via_status: string;
  via_valor?: string;
  via_formapagamento?: string;
  via_servico?: string;
  fun_nome?: string;
  mot_placa?: string;
  mot_modelo?: string;
  sol_codigo: number;
  fun_telefone?: string;
};

const ProgressBar = ({ duration = 3000 }: { duration?: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    const animation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [duration]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressFill, { width }]} />
    </View>
  );
};

export default function PendingTravel() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [data, setData] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseURL = "https://backend-turma-a-2025.onrender.com";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const id = user?.id;
      if (!id) throw new Error("ID do usuário não encontrado");

      const response = await fetch(`${baseURL}/api/viagens/andamento/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar viagem em andamento");

      const json = await response.json();
      if (json.sucesso && json.viagem) setData(json.viagem);
      else setData(null);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionario = async (solicitacaoId: number) => {
    try {
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

      if (!response.ok)
        throw new Error(`Erro ao buscar funcionário: ${response.status}`);

      const json = await response.json();
      if (json.sucesso && json.funcionario) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                fun_nome: json.funcionario.fun_nome,
                fun_telefone: json.funcionario.fun_telefone,
                mot_modelo: json.funcionario.mot_modelo,
                mot_placa: json.funcionario.mot_placa,
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Erro ao buscar informações do funcionário:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data?.sol_codigo && data.via_status === "em andamento") {
      fetchFuncionario(data.sol_codigo);
    }
  }, [data]);

  if (loading) return null;

  if (error) return null;

  if (!data || data.via_status !== "em andamento") return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Viagem em andamento</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Ativa</Text>
        </View>
      </View>

      <ProgressBar duration={3500} />

      <View style={styles.infoSection}>
        <Info label="Origem" value={data.via_origem} />
        <Info label="Destino" value={data.via_destino} />
        <Info label="Status" value={data.via_status.toUpperCase()} highlight />

        <View style={styles.line} />

        <Info label="Mototaxista" value={data.fun_nome || "---"} />
        <Info label="Modelo" value={data.mot_modelo || "---"} />
        <Info label="Placa" value={data.mot_placa || "---"} />
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/TravelDetails/${data.via_codigo}`)}
        style={styles.detailsBtn}
      >
        <Text style={styles.detailsText}>Ver detalhes</Text>
      </TouchableOpacity>
    </View>
  );
}

const Info = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[
        styles.infoValue,
        highlight && { color: "#FFA000" },
        value === "---" && { color: "#999", fontStyle: "italic" },
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: "Righteous",
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFA000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: "Righteous",
    color: "#fff",
    fontSize: 14,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#111",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
    marginRight: 6,
  },
  statusText: {
    fontFamily: "Righteous",
    fontSize: 12,
    color: "#34C759",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFA000",
    borderRadius: 2,
  },
  infoSection: {
    marginTop: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontFamily: "Righteous",
    color: "#777",
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    fontFamily: "Righteous",
    color: "#111",
    fontSize: 13,
    textAlign: "right",
    flex: 1,
  },
  line: {
    height: 1,
    backgroundColor: "#F2F2F2",
    marginVertical: 8,
  },
  detailsBtn: {
    marginTop: 8,
    alignItems: "center",
  },
  detailsText: {
    fontFamily: "Righteous",
    color: "#FFA000",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
