import { useRouter } from 'expo-router';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const token = await AsyncStorage.getItem('token');
      router.replace(token ? '/(authenticated)/Home' : '/login');
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
