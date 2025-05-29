import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import Header from "../../Components/header";

export default function TravelDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [viagem, setViagem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchViagem = async () => {
      setLoading(true);
      try {
        const route = `https://backend-turma-a-2025.onrender.com/api/viagens/viagem/${id}`;
        const response = await fetch(route);

        if (!response.ok) {
          throw new Error(`Erro de API: ${response.status}`);
        }

        const json = await response.json();
        setViagem(json);
      } catch (err: any) {
        console.error("Erro ao carregar os detalhes da viagem:", err);
        setError(err.message || "Erro ao carregar os detalhes da viagem.");
      } finally {
        setLoading(false);
      }
    };

    fetchViagem();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  if (!viagem) {
    return (
      <View style={styles.center}>
        <Text>Viagem não encontrada.</Text>
      </View>
    );
  }

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.label}>Origem:</Text>
        <Text>{viagem.via_origem}</Text>

        <Text style={styles.label}>Destino:</Text>
        <Text>{viagem.via_destino}</Text>

        <Text style={styles.label}>Data:</Text>
        <Text>{new Date(viagem.via_data).toLocaleString()}</Text>

        <Text style={styles.label}>Preço:</Text>
        <Text>R$ {parseFloat(viagem.via_valor).toFixed(2)}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text>{viagem.via_status}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
