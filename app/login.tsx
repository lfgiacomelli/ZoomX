import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'https://backend-turma-a-2025.onrender.com';

export default function Login() {
  const [usu_email, setEmail] = useState('');
  const [usu_senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!usu_email.trim() || !usu_senha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        usu_email,
        usu_senha,
      });

      const data = response.data;

      if (data.sucesso) {
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        } else {
          await AsyncStorage.setItem('token', 'logado');
        }

        if (data.usuario) {
          await AsyncStorage.setItem('id', data.usuario.id.toString());
          await AsyncStorage.setItem('nome', data.usuario.nome);
          await AsyncStorage.setItem('email', data.usuario.email);
          await AsyncStorage.setItem('telefone', data.usuario.telefone);
          await AsyncStorage.setItem('criado_em', data.usuario.criado_em.toString());
        }

        router.replace('/(authenticated)/Home');
        console.log('Login bem-sucedido:', data);
      } else {
        Alert.alert('Erro', data.mensagem || 'Credenciais inválidas.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          Alert.alert(
            'Erro de Login',
            error.response.data?.mensagem ||
            `Erro ${error.response.status}: Não foi possível conectar ao servidor.`
          );
        } else if (error.request) {
          Alert.alert(
            'Erro de Rede',
            'Não foi possível conectar ao servidor. Verifique sua conexão e o endereço da API.'
          );
        } else {
          Alert.alert('Erro', error.message || 'Ocorreu um erro inesperado.');
        }
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={usu_email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={usu_senha}
        onChangeText={setSenha}
        placeholderTextColor="#888"
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Entrar" onPress={handleLogin} disabled={loading} />
      )}
      <Button
        title="Criar Conta"
        onPress={() => router.push('/signin')}
        disabled={loading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
