import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
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

};

const ProgressBar = ({ duration = 3000 }: { duration?: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateProgress = () => {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => animateProgress());
    };

    animateProgress();

    return () => progressAnim.stopAnimation();
  }, []);

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
      if (!response.ok) throw new Error(`Erro de API: ${response.status}`);

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

  useEffect(() => {
    fetchData();
  }, []);

  if (!data || data.via_status != "em andamento") {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VIAGEM EM ANDAMENTO</Text>

      <View style={styles.card}>
        <ProgressBar duration={3500} />

        <View style={styles.infoContainer}>
          <InfoRow label="ORIGEM" value={data.via_origem} />
          <InfoRow label="DESTINO" value={data.via_destino} />
          <InfoRow
            label="STATUS"
            value={data.via_status.toUpperCase()}
            isStatus
          />
          <InfoRow label='Mototaxista' value={data.fun_nome || "Indisponível"} />
          <InfoRow label='Moto' value={data.mot_modelo || "Indisponível"} />
          <InfoRow label='Placa' value={data.mot_placa || "Indisponível"} />
        </View>
        <TouchableOpacity
          onPress={() => {
            router.push('/TravelDetails/' + data.via_codigo);
          }}
          style={{ padding: 16, backgroundColor: "#F5F5F5" }}
        >
          <Text
            style={{ color: "#212121", fontFamily: "Righteous", fontSize: 14, textDecorationLine: "underline", textAlign: "center" }}
          >
            Detalhes da Viagem
          </Text>
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
    <Text style={isStatus ? styles.statusValue : styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingIndicator: {
    transform: [{ scale: Platform.OS === "ios" ? 1.2 : 1 }],
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#212121",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginHorizontal: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  progressBarContainer: {
    height: 3,
    width: "100%",
    backgroundColor: "#ECEFF1",
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
    marginBottom: 16,
    alignItems: "center",
  },
  label: {
    fontFamily: "Righteous",
    color: "#757575",
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  value: {
    fontFamily: "Righteous",
    color: "#212121",
    fontSize: 14,
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
    fontWeight: "500",
  },
  statusValue: {
    fontFamily: "Righteous",
    color: "#FFA000",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },
});
