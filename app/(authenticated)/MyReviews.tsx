import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Avaliacao {
  ava_codigo: string;
  via_codigo: string;
  ava_nota: number;
  ava_comentario: string;
  ava_data_avaliacao: string;
}

const MyReviews = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvaliacoes = async () => {
    try {
      const usu_codigo = await AsyncStorage.getItem('id');
      if (!usu_codigo) throw new Error('Usuário não autenticado');

      const response = await fetch(`https://backend-turma-a-2025.onrender.com/avaliacoes/usuario/${usu_codigo}`);
      const data = await response.json();
      setAvaliacoes(data);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Você ainda não avaliou nenhuma viagem.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={avaliacoes}
        keyExtractor={(item) => item.ava_codigo}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nota}>Nota: {item.ava_nota} ⭐</Text>
            <Text style={styles.comentario}>{item.ava_comentario}</Text>
            <Text style={styles.data}>{new Date(item.ava_data_avaliacao).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default MyReviews;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  nota: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  comentario: {
    fontSize: 14,
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
