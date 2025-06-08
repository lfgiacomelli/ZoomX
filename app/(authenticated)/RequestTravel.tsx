import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Header from "../Components/header";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Battery from "expo-battery";
import LottieView from "lottie-react-native";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteData = {
  coords: Coordinates[];
  distanceKm: number;
};

const calculateHaversineDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371e3;
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getCoordsFromAddress = async (address: string): Promise<Coordinates> => {
  if (!address.trim()) throw new Error("Endereço não pode estar vazio");

  const cidadeFixa = "Presidente Venceslau, SP, Brasil";
  const fullAddress = `${address}, ${cidadeFixa}`;
  const apiKey = "874a48e4c97d45ffbeb032631879c5c8";

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        fullAddress
      )}&key=${apiKey}&language=pt&countrycode=br`
    );

    if (!response.ok) throw new Error("Erro na requisição do geocoding");

    const data = await response.json();

    if (!data.results || data.results.length === 0)
      throw new Error("Endereço não encontrado");

    const firstResult = data.results[0];

    return {
      latitude: firstResult.geometry.lat,
      longitude: firstResult.geometry.lng,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error(`Não foi possível encontrar o endereço: ${address}`);
  }
};

const getRouteFromOSRM = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteData> => {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Rota não encontrada");
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0)
      throw new Error("Rota não encontrada");

    const distanceKm = data.routes[0].distance / 1000;

    const coords = data.routes[0].geometry.coordinates.map(
      (coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0],
      })
    );

    return { coords, distanceKm };
  } catch (error) {
    console.error("OSRM error:", error);
    throw new Error(
      "Erro ao calcular a rota. Tente endereços mais específicos."
    );
  }
};

export default function RequestTravel() {
  const [startAddress, setStartAddress] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [endAddress, setEndAddress] = useState("");
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [markers, setMarkers] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false);
  const [observacoes, setObservacoes] = useState<string>("");
  const animationRef = useRef(null);
  const [suggestedAddress, setSuggestedAddress] = useState("");
  const [tempo, setTempo] = useState<number | null>(null);

  const initialRegion = {
    latitude: -21.8756,
    longitude: -51.8437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  const [region, setRegion] = useState(initialRegion);

  const snapPoints = useMemo(() => ["35%", "50%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    setIsBottomSheetActive(index >= 0);
  }, []);

  const calcularRota = async () => {
    if (!startAddress.trim() || !endAddress.trim()) {
      Alert.alert("Erro", "Por favor, preencha ambos os endereços.");
      return;
    }
    if (startAddress.toLowerCase() === endAddress.toLowerCase()) {
      Alert.alert("Erro", "Os endereços de partida e destino são iguais.");
      return;
    }

    setIsLoading(true);
    setRouteCoords([]);
    setMarkers([]);
    setDistance(null);
    setPrice(null);

    try {
      const [origin, destination] = await Promise.all([
        getCoordsFromAddress(startAddress),
        getCoordsFromAddress(endAddress),
      ]);

      const distanceBetween = calculateHaversineDistance(origin, destination);

      if (distanceBetween < 50) {
        Alert.alert(
          "Endereços muito próximos",
          "Os endereços devem estar a pelo menos 50 metros de distância."
        );
        setIsLoading(false);
        return;
      }

      setMarkers([origin, destination]);

      const { coords, distanceKm } = await getRouteFromOSRM(
        origin,
        destination
      );
      const tempo = distanceKm * 2;
      const hora = new Date().getHours();
      let calculatedPrice = 0;

      if (hora < 6 || hora >= 22) {
        calculatedPrice = 6.2 + distanceKm * 1;
      } else {
        calculatedPrice = 5.8 + distanceKm * 0.8;
      }

      setRouteCoords(coords);
      setDistance(distanceKm);
      setPrice(calculatedPrice);
      setTempo(tempo);

      bottomSheetRef.current?.expand();

      if (mapRef.current && coords.length > 0) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao calcular rota"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolicitar = async () => {
    if (distance === null || price === null) {
      Alert.alert("Erro", "Calcule a rota antes de solicitar.");
      return;
    }

    try {
      await AsyncStorage.setItem("startAddress", startAddress);
      console.log("Endereço de partida salvo:", startAddress);
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
    }

    try {
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!userId || !token) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        "https://backend-turma-a-2025.onrender.com/api/solicitacoes/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sol_origem: startAddress,
            sol_destino: endAddress,
            sol_distancia: distance,
            sol_valor: price,
            sol_servico: "Mototáxi",
            usu_codigo: Number(userId),
            sol_data: new Date().toISOString(),
            sol_formapagamento: formaPagamento,
            sol_observacoes: "Pedido via App",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar solicitação");
      }

      router.push({
        pathname: "/PendingRequest",
        params: { solicitacaoId: data.sol_codigo },
      });
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      Alert.alert("Erro", "Não foi possível criar a solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStartAddress("");
    setEndAddress("");
    setRouteCoords([]);
    setMarkers([]);
    setDistance(null);
    setPrice(null);
    setRegion(initialRegion);
    bottomSheetRef.current?.close();
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion);
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!endAddress.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      calcularRota();
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [endAddress]);
  if (isBottomSheetActive && startAddress && endAddress) {
    Keyboard.dismiss();
  }
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      if (isBottomSheetActive) {
        bottomSheetRef.current?.close();
      }
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      if (isBottomSheetActive) {
        bottomSheetRef.current?.expand();
      }
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [isBottomSheetActive]);
  useEffect(() => {
    const loadSuggestedAddress = async () => {
      try {
        const address = await AsyncStorage.getItem("startAddress");
        if (address) setSuggestedAddress(address);
      } catch (error) {
        console.error("Erro ao carregar endereço salvo:", error);
      }
    };

    loadSuggestedAddress();
  }, []);

  const handleUseSuggested = () => {
    setStartAddress(suggestedAddress);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header />
      <StatusBar barStyle="light-content" />
      <View style={styles.form}>
        <View style={styles.iconColumn}>
          <Ionicons name="location-outline" size={24} color="#000" />
          <View style={styles.line} />
          <Ionicons name="flag-outline" size={24} color="#000" />
        </View>

        <View style={styles.inputColumn}>
          <TextInput
            style={styles.input}
            placeholder="Endereço de partida (ex: Rua A, 123)"
            value={startAddress}
            onChangeText={setStartAddress}
            clearButtonMode="while-editing"
            returnKeyType="next"
          />
          {suggestedAddress && startAddress !== suggestedAddress && (
            <TouchableOpacity
              style={styles.suggestionBox}
              onPress={handleUseSuggested}
            >
              <View style={styles.column}>
                <Text style={styles.suggestionTitle}>
                  Usar esse endereço novamente:
                </Text>
                <Text style={styles.suggestionAddress}>{suggestedAddress}</Text>
              </View>
              <Ionicons name="arrow-up-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            placeholder="Endereço de destino (ex: Av. B, 456)"
            value={endAddress}
            onChangeText={setEndAddress}
            clearButtonMode="while-editing"
            returnKeyType="done"
          />
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={animationRef}
            source={require("../../assets/loading_motorcycle.json")}
            autoPlay
            loop
            style={{ width: 50, height: 50 }}
          />
          <Text style={styles.loadingText}>Calculando rota...</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {markers.map((marker, idx) => (
            <Marker key={idx} coordinate={marker}>
              <Image
                source={
                  idx === 0
                    ? require("../../assets/partida.png")
                    : require("../../assets/destino.png")
                }
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#000"
              strokeWidth={4}
            />
          )}
        </MapView>
        {routeCoords.length > 0 && !isBottomSheetActive && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => bottomSheetRef.current?.expand()}
          >
            <Text style={styles.floatingButtonText}>Continuar solicitando</Text>
            <MaterialIcons name="keyboard-arrow-up" size={24} color="white" />
          </TouchableOpacity>
        )}
        {!isBottomSheetActive && !startAddress && !endAddress && (
          <TouchableOpacity
            style={styles.comeBack}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        detached={true}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {distance !== null && price !== null && (
            <>
              <Text style={styles.bottomSheetTitle}>Detalhes da Corrida</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Origem:</Text>
                <Text style={styles.detailValue}>{startAddress}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destino:</Text>
                <Text style={styles.detailValue}>{endAddress}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distância:</Text>
                <Text style={styles.detailValue}>{distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tempo Estimado:</Text>
                <Text style={styles.detailValue}>
                  {tempo ? `${Math.ceil(tempo)} min` : "Calculando..."}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Preço:</Text>
                <Text style={[styles.detailValue, styles.priceText]}>
                  R$ {price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Forma de Pagamento:</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={formaPagamento}
                    onValueChange={(itemValue) => setFormaPagamento(itemValue)}
                  >
                    <Picker.Item label="Dinheiro" value="Dinheiro" />
                    <Picker.Item
                      label="Cartão de Crédito"
                      value="Cartão de Crédito"
                    />
                    <Picker.Item
                      label="Cartão de Débito"
                      value="Cartão de Débito"
                    />
                    <Picker.Item label="PIX" value="PIX" />
                  </Picker>
                </View>
              </View>
              <TouchableOpacity
                style={styles.solicitarButton}
                onPress={handleSolicitar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.solicitarButtonText}>
                    Solicitar Corrida
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  form: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#f0f0f0",
  },
  iconColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: "#000",
    marginVertical: 4,
  },
  inputColumn: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "Righteous",
    color: "#000",
  },
  loadingContainer: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flexDirection: "column",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: "Righteous",
  },
  mapContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  map: {
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderStartEndRadius: 0,
    borderEndEndRadius: 0,
    borderTopColor: "#ccc",
  },
  handleIndicator: {
    backgroundColor: "#aaa",
    width: 40,
    height: 5,
    alignSelf: "center",
    marginVertical: 5,
    borderRadius: 3,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
    fontFamily: "Righteous",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  detailLabel: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Righteous",
  },
  detailValue: {
    fontSize: 16,
    color: "#000",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 10,
    fontFamily: "Righteous",
  },
  priceText: {
    color: "#2e7d32",
    fontFamily: "Righteous",
  },
  pickerContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontFamily: "Righteous",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  solicitarButton: {
    backgroundColor: "#000",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  solicitarButtonText: {
    color: "#f0f0f0",
    fontSize: 18,
    fontFamily: "Righteous",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",
    marginRight: 8,
  },
  apagar: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  suggestionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },

  column: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },

  suggestionTitle: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },

  suggestionAddress: {
    fontFamily: "Righteous",
    fontSize: 16,
  },
  comeBack: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
});
