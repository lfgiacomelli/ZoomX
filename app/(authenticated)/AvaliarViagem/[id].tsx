import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AvaliarViagem() {
  const { id: via_codigo } = useLocalSearchParams();
  const router = useRouter();

  const [usu_codigo, setUsuCodigo] = useState<string | null>(null);
  const [nota, setNota] = useState<string>('5'); // default nota 5
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsuCodigo = async () => {
      const codigo = await AsyncStorage.getItem('id');
      setUsuCodigo(codigo);
    };
    fetchUsuCodigo();
  }, []);

  const enviarAvaliacao = async () => {
    if (!usu_codigo) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!nota || Number(nota) < 1 || Number(nota) > 5) {
      Alert.alert('Erro', 'Nota deve ser entre 1 e 5.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://backend-turma-a-2025.onrender.com/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usu_codigo,
          via_codigo,
          ava_nota: Number(nota),
          ava_comentario: comentario.trim() || null,
          ava_data_avaliacao: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Avaliação enviada com sucesso!', [
          {
            text: 'Ok',
            onPress: () => router.replace('/(authenticated)/home'),
          },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  if (!usu_codigo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Carregando dados do usuário...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar Viagem</Text>

      <Text style={styles.label}>Nota (1 a 5):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={1}
        value={nota}
        onChangeText={setNota}
      />

      <Text style={styles.label}>Comentário (opcional):</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        numberOfLines={4}
        value={comentario}
        onChangeText={setComentario}
      />

      <TouchableOpacity style={styles.button} onPress={enviarAvaliacao} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Avaliação</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
