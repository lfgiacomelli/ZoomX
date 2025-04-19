import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import useRighteousFont from '../hooks/Font/index';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fontLoaded = useRighteousFont();

  async function handleLogin() {
    const isBiometricAvailable = await LocalAuthentication.isEnrolledAsync();

    if (!isBiometricAvailable) {
      return Alert.alert('Erro', 'Nenhuma biometria cadastrada.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticar com biometria',
    });

    if (result.success) {
      setLoading(true);
      await AsyncStorage.setItem('auth', 'true');
      setTimeout(() => {
        router.replace('/(authenticated)/home');
      }, 1000);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      <Text style={styles.title}>Faça login:</Text>
      <Text style={styles.subtitle}>Peça corridas ainda hoje!</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Insira seu E-mail"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Insira sua Senha"
          placeholderTextColor="#aaa"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#aaa" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>LOGIN</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() =>router.replace('/(authenticated)/home')} style={{ marginBottom: 20 }}>
        <Text style={styles.buttonText}>LOGIN COM BIOMETRIA</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signin')}>
        <Text style={styles.register}>
          <Ionicons name="person-add" size={16} /> Não possui conta?{' '}
          <Text style={styles.link}>Crie agora!</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -30,
    marginTop: -250,
  },
  logoImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 400,
    height: 400,
  },
  title: {
    fontSize: 40,
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'Righteous',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
    fontFamily: 'Righteous',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#111',
  },
  icon: {
    marginRight: 5,
  },
  input: {
    fontFamily: 'Righteous',
    flex: 1,
    color: '#fff',
    height: 45,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Righteous',
    fontSize: 16,
  },
  register: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Righteous',
  },
  link: {
    textDecorationLine: 'underline',
    fontFamily: 'Righteous',
  },
});
