import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type ViagemNaoAvaliada = {
  via_codigo: string;
  via_data?: string;
  via_status?: string;
};

const AvaliarViagem: React.FC = () => {
  const [viagem, setViagem] = useState<ViagemNaoAvaliada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const translateY = useState(new Animated.Value(20))[0];

  useEffect(() => {
    const fetchViagemNaoAvaliada = async () => {
      try {
        const usuarioId = await AsyncStorage.getItem("id");
        const token = await AsyncStorage.getItem("token");

        if (!usuarioId || !token) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://backend-turma-a-2025.onrender.com/api/viagens/naoavaliada/${usuarioId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

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

  if (loading || error || !viagem) return null;

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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontFamily: "Righteous",
    color: "#000",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#555",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Righteous",
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});

export default AvaliarViagem;
