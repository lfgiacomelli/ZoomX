import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Viagem = {
  via_codigo?: number;
  via_status: string;
  via_origem?: string;
  via_destino?: string;
  via_data_inicio?: string;
};

export default function VerificarEmAndamento() {
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsuCodigoAndFetch() {
      try {
        setLoading(true);
        setError(null);
        setMensagem(null);

        const id = await AsyncStorage.getItem('id');
        if (!id) {
          setError('Usuário não logado.');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://backend-turma-a-2025.onrender.com/api/viagens/andamento/${id}`);
        const data = await response.json();

        if (!response.ok || data.sucesso === false) {
          if (data.mensagem) {
            setMensagem(data.mensagem);
          } else {
            setError('Erro ao buscar viagem em andamento.');
          }
          setViagem(null);
          setLoading(false);
          return;
        }

        setViagem(data.viagem || { via_status: data.status });
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    loadUsuCodigoAndFetch();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.text}>Carregando viagem em andamento...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.text, { color: 'red' }]}>Erro: {error}</Text>
      </View>
    );
  }

  if (mensagem) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>{mensagem}</Text>
      </View>
    );
  }

  if (!viagem) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Nenhuma viagem em andamento no momento.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viagem em andamento</Text>
      <Text style={styles.info}>Status: {viagem.via_status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Righteous',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Righteous',
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
    fontFamily: 'Righteous',
  },
});
