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

  useEffect(() => {
    const fetchViagemNaoAvaliada = async () => {
      try {
        const usuarioId = await AsyncStorage.getItem("id");
        if (!usuarioId) {
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
              Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        if (data.sucesso && data.viagem) {
          setViagem(data.viagem);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
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
    <View style={styles.container}>
      <Text style={styles.title}>Você possui uma avaliação pendente!</Text>
      <TouchableOpacity style={styles.button} onPress={handleAvaliarPress}>
        <Text style={styles.buttonText}>Avaliar Viagem</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    marginBottom:18
  },
  title: {
    fontSize: 18,
    fontFamily: "Righteous",
    color: "#222",
    marginBottom: 12,
    textAlign: "left",
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: "Righteous",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",
    letterSpacing: 0.8,
  },
});


export default AvaliarViagem;
