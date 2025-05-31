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

const Home = () => {
  const router = useRouter();
  const fontLoaded = useRighteousFont();
  const [statusLeitor, setStatusLeitor] = useState(false);
  const [userFirstName, setUserFirstName] = useState("Usuário");

  const getFirstNameFromStorage = async () => {
    try {
      const fullName = await AsyncStorage.getItem("nome");

      if (fullName) {
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0];
        setUserFirstName(firstName);
      }
    } catch (error) {
      console.error("Erro ao buscar o nome:", error);
    }
  };
  useEffect(() => {
    getFirstNameFromStorage();
  }, []);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const services = [
    {
      id: 1,
      title: "Moto Táxi",
      icon: require("../../assets/motorcycle.png"),
      description: "Viagens rápidas pela cidade",
      action: () => router.push("/RequestTravel"),
      color: "#FF6B00",
    },
    {
      id: 2,
      title: "Entregas",
      icon: require("../../assets/box.png"),
      description: "Envie seus pacotes com segurança",
      action: () => router.push("/RequestDelivery"),
      color: "#00A859",
    },
    {
      id: 3,
      title: "Encomendas",
      icon: require("../../assets/box.png"),
      description: "Receba suas compras em casa",
      action: () => router.push("/RequestDelivery"),
      color: "#2D9CDB",
    },
    {
      id: 4,
      title: "Urgências",
      icon: require("../../assets/emergency.png"),
      description: "Transporte rápido para emergências",
      action: () => router.push("/RequestTravel"),
      color: "#EB5757",
    },
  ];

  const benefits: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    text: string;
  }[] = [
    { icon: "shield-checkmark", text: "Motoristas verificados" },
    { icon: "time", text: "Atendimento 24 horas" },
    { icon: "cash", text: "Preços acessíveis" },
    { icon: "location", text: "Cobertura em toda a região" },
  ];

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data.via_codigo) {
          router.push(`/AvaliarViagem/${data.via_codigo}`);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão negada para acessar localização");
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
    };

    checkStatus();

    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (isEnabled) => {
        setStatusLeitor(isEnabled);
      }
    );

    return () => subscription.remove();
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
          <Text style={styles.welcomeTitle}>Olá, {userFirstName}!</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que você precisa?</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { borderTopColor: service.color }]}
                onPress={service.action}
                accessible={true}
                accessibilityLabel={service.title}
                accessibilityHint={`Clique para solicitar serviço de ${service.title}`}
              >
                <View style={styles.serviceIconContainer}>
                  <Image
                    source={service.icon}
                    style={styles.serviceIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.mainActionButton}
          onPress={() => router.push("/RequestTravel")}
          accessible={true}
          accessibilityLabel="Solicitar Moto Táxi"
          accessibilityHint="Clique para solicitar um moto táxi agora"
        >
          <Image
            source={require("../../assets/motorcycle.png")}
            style={styles.serviceIcon}
          />
          <Text style={styles.mainActionText}>SOLICITAR AGORA</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossas Vantagens</Text>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={styles.benefitIconContainer}>
                  <Ionicons name={benefit.icon} size={20} color="#000" />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {location?.latitude && location?.longitude && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sua Localização</Text>
              <TouchableOpacity onPress={() => router.push("/Mapa")}>
                <Text style={styles.seeMore}>Ver mapa completo</Text>
              </TouchableOpacity>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precisa de ajuda?</Text>
          <View style={styles.contactOptions}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: "#000" }]}
              onPress={() => Linking.openURL("tel:+5511999999999")}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Ligar para suporte</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: "#000" }]}
              onPress={() => router.push("/Configuration")}
            >
              <Ionicons name="help-circle" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Central de ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.adsSection}>
          <Text style={styles.sectionTitle}>Dicas e Promoções</Text>
          <AnunciosCarousel />
        </View>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  horaAtual: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
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
  seeMore: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderTopWidth: 4,
    borderColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  serviceTitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  serviceDescription: {
    fontFamily: "Righteous",
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  mainActionButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 18,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Righteous",
    marginLeft: 12,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#333",
    flex: 1,
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
  contactOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  contactButtonText: {
    color: "#fff",
    fontFamily: "Righteous",
    fontSize: 12,
    marginLeft: 8,
  },
  adsSection: {
    marginBottom: 24,
  },
});

export default Home;
