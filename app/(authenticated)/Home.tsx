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
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRighteousFont from "../../hooks/Font/index";
import { useRouter } from "expo-router";
import Header from "../Components/header";
import Tab from "../Components/Tab";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import AnunciosCarousel from "../Components/Anuncios";
import * as Notifications from "expo-notifications";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import LastActivity from "../Components/LastActivity";
import Services from "../Components/Services";
import Benefits from "../Components/Benefits";
import Help from "../Components/Help";
import PendingTravel from "../Components/PendingTravel";

const Home = () => {
  const router = useRouter();
  const [helpVisible, setHelpVisible] = useState(false);
  const fontLoaded = useRighteousFont();
  const [userFirstName, setUserFirstName] = useState("Usuário");
  const [statusLeitor, setStatusLeitor] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobileData, setIsMobileData] = useState(false);
  const getFirstNameFromStorage = async () => {
    try {
      const fullName = await AsyncStorage.getItem("nome");
      if (fullName) {
        const firstName = fullName.trim().split(" ")[0];
        setUserFirstName(firstName);
      }
    } catch (error) {
      console.error("Erro ao buscar o nome:", error);
    }
  };

  const startWatchingLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permissão negada para acessar localização");
      return;
    }

    await Location.watchPositionAsync(
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

  useEffect(() => {
    getFirstNameFromStorage();
    startWatchingLocation();

    const handleNotification =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data.via_codigo) {
          router.push(`/AvaliarViagem/${data.via_codigo}`);
        }
      });

    const checkScreenReader = async () => {
      const status = await AccessibilityInfo.isScreenReaderEnabled();
      setStatusLeitor(status);
    };

    checkScreenReader();

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setStatusLeitor
    );

    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      setIsMobileData(state.type === "cellular");
    });

    return () => {
      handleNotification.remove();
      screenReaderSubscription.remove();
      netInfoUnsubscribe();
    };
  }, []);

  if (!fontLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.loadingLogo}
        />
        <Text style={styles.loadingText}>Preparando tudo para você...</Text>
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.welcomeTitle}>Olá, {userFirstName}!</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/profile")}
              accessible={true}
              accessibilityLabel="Perfil"
              accessibilityHint="Clique para acessar seu perfil"
            >
              <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {isMobileData && (
            <Text style={styles.welcomeSubtitle}>
              Você está usando dados móveis
            </Text>
          )}
        </View>
        <Services />
        <PendingTravel />

        <Benefits />
        <LastActivity />
        {location?.latitude && location?.longitude && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sua Localização</Text>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                toolbarEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Sua localização"
                />
              </MapView>
            </View>
          </View>
        )}
        <Help />
        <View style={styles.adsSection}>
          <Text style={styles.sectionTitle}>Dicas e Promoções</Text>
          <AnunciosCarousel />
        </View>
      </ScrollView>
      {/* <TouchableOpacity
        style={styles.solicitarButton} onPress={() => router.push("/RequestTravel")}>
        <MaterialIcons name="keyboard-arrow-up" size={22} color="white" />
        <Text style={styles.solicitarButtonText}>SolicitaO r Mototáxi</Text>
      </TouchableOpacity> */}
      <Tab />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 16,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingLogo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 24,
    paddingBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  welcomeTitle: {
    fontFamily: "Righteous",
    fontSize: 28,
    color: "#000",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  map: {
    width: "100%",
    height: "100%",
  },

  adsSection: {
    marginBottom: 24,
  },
  // solicitarButton: {
  //   width: 200,
  //   position: "absolute",
  //   bottom: 100,
  //   right: 20,
  //   backgroundColor: "#000",
  //   borderRadius: 50,
  //   padding: 16,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 4,
  //   flexDirection: "row",
  // },
  // solicitarButtonText: {
  //   color: "#fff",
  //   fontFamily: "Righteous",
  //   fontSize: 16,
  //   marginTop: 4,
  // },
  profileButton: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 8,
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Home;
