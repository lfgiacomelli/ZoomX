import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useRighteousFont from '../../hooks/Font/index';
import Header from '../Components/header';
import Tab from '../Components/Tab';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

const Home = () => {
  const router = useRouter();
  const fontLoaded = useRighteousFont();
  const [statusLeitor, setStatusLeitor] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão negada para acessar localização');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    };

    startWatching();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await AccessibilityInfo.isScreenReaderEnabled();
      setStatusLeitor(status);
      console.log("Leitor de tela ativo?", status ? "Sim" : "Não");
    };

    checkStatus();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setStatusLeitor(isEnabled);
        console.log("Leitor de tela mudou:", isEnabled ? "Ativo" : "Inativo");
      }
    );

    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth');
    router.replace('/login');
  };

  if (!fontLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/RequestTravel')}>
            <Image source={require('../../assets/motorcycle.png')} style={styles.icon} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.actionText}>Viagem</Text>
              <View style={styles.underline}></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/RequestDelivery')}>
            <Image source={require('../../assets/box.png')} style={styles.icon} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.actionText}>Entrega</Text>
              <View style={styles.underline}></View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.callButton} onPress={() => router.push('/RequestTravel')}>
          <Text style={styles.callText}>Peça seu Moto Táxi agora!</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsRow}>
            <View style={styles.optionBox}>
              <Text style={styles.optionText}>Empresa Própria</Text>
            </View>
            <View style={styles.optionBox}>
              <Text style={styles.optionText}>Agilidade</Text>
            </View>
            <View style={styles.optionBox}>
              <Text style={styles.optionText}>Segurança</Text>
            </View>
          </View>
        </ScrollView>

        {location?.latitude && location?.longitude && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapTitle}>Você está aqui!</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Você está aqui!"
                accessible={true}
                accessibilityLabel="Você está aqui!"
                accessibilityHint="Localização atual do usuário"
              />
            </MapView>
          </View>
        )}

        <View style={styles.aboutBusiness}>
          <Text style={styles.aboutBusinessTitle}>Sobre a Empresa</Text>
          <Text style={styles.aboutBusinessText}>
            Nossa empresa oferece serviços de transporte e entrega com segurança e agilidade.
          </Text>
          <Text style={styles.aboutBusinessText}>
            Estamos sempre prontos para atender você!
          </Text>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        </ScrollView>
      </ScrollView>
      <Tab />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight + 10,
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    top: -40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    marginBottom: -20
  },
  actionButton: {
    width: 180,
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 3,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Righteous',
  },
  callButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 12,
    alignItems: 'center',
  },
  callText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Righteous',
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  optionBox: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 200,
    marginRight: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionText: {
    fontFamily: 'Righteous',
    color: '#000',
    textAlign: 'center',
    fontSize: 20,
  },
  mapContainer: {

    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 10,
    marginBottom: 20,
  },
  mapTitle: {
    fontFamily: 'Righteous',
    marginBottom: 8,
    fontSize: 19,
    color: '#000',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  aboutBusiness: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  aboutBusinessTitle: {
    fontFamily: 'Righteous',
    fontSize: 22,
    color: '#000',
    marginBottom: 8,
  },
  aboutBusinessText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#000',
  },
  underline: {
    height: 2,
    width: '90%',
    backgroundColor: '#fff',
    marginTop: 5,
  },

});

export default Home;
