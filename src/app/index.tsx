import { useRouter } from 'expo-router';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const BASE_URL = 'https://backend-turma-a-2025.onrender.com';

export default function Index() {
  const router = useRouter();

  const verificarBanimento = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

    if (!id || !token) return false;

    try {
      const res = await fetch(`${BASE_URL}/api/usuarios/${id}/banimento`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (json.banido) {
        await AsyncStorage.clear();
        Alert.alert(
          "Você teve sua conta suspensa",
          "Acreditamos que você possa ter violado nossas políticas."
        );
        router.replace("/login");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao verificar banimento:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const banido = await verificarBanimento();

      if (!banido) {
        router.replace('/(authenticated)/Home');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('@animations/splash.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  animation: {
    width: Dimensions.get('window').width * 1.1,
    height: Dimensions.get('window').width * 1.1,
  },
});
