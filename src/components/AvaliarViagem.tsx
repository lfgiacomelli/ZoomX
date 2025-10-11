import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@contexts/useAuth";

type ViagemNaoAvaliada = {
  via_codigo: string;
  via_data: string;
  via_status: string;
  usu_nome: string;
  usu_email: string;
  fun_nome?: string;
};

const AvaliarViagem: React.FC = () => {
  const BASE_URL = "https://backend-turma-a-2025.onrender.com";
  const [viagem, setViagem] = useState<ViagemNaoAvaliada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchViagemNaoAvaliada = async () => {
      try {
        const id = user?.id;
        if (!id || !token) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${BASE_URL}/api/viagens/naoavaliada/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`Erro na API: ${response.status}`);

        const data = await response.json();

        if (data.sucesso && data.viagem) {
          setViagem(data.viagem);

          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          setViagem(null);
        }
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchViagemNaoAvaliada();
  }, []);

  const handleAvaliarPress = () => {
    if (viagem) {
      router.replace({
        pathname: "/AvaliarViagem/[id]",
        params: { id: viagem.via_codigo },
      });
    }
  };

  if (loading) return null

  if (error || !viagem) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.title}>🚨 Avaliação pendente</Text>
      <Text style={styles.subtitle}>
        Sua última corrida ainda não foi avaliada.
      </Text>
      <Text style={styles.info}>
        Mototaxista: {viagem.fun_nome || "N/A"}{"\n"}
        Data: {new Date(viagem.via_data).toLocaleString()}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleAvaliarPress}>
        <MaterialIcons name="rate-review" size={20} color="#fff" />
        <Text style={styles.buttonText}>Avaliar agora</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 21,
    fontFamily: "Righteous",
    color: "#000",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Righteous",
    color: "#555",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  info: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#333",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Righteous",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default AvaliarViagem;
