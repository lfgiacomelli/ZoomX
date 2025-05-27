import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Header from "../Components/header";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteData = {
  coords: Coordinates[];
  distanceKm: number;
};

// Calcula distância entre duas coordenadas usando fórmula de Haversine
const calculateHaversineDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // raio da Terra em metros
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distância em metros
};

// Converte endereço em coordenadas via API OpenCageData
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

// Busca rota via OSRM API
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

export default function RotaScreen() {
  const [startAddress, setStartAddress] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [endAddress, setEndAddress] = useState("");
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [markers, setMarkers] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const initialRegion = {
    latitude: -21.8756,
    longitude: -51.8437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  const [region, setRegion] = useState(initialRegion);

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

      const { coords, distanceKm } = await getRouteFromOSRM(origin, destination);
      const calculatedPrice = 7 + distanceKm * 2;

      setRouteCoords(coords);
      setDistance(distanceKm);
      setPrice(calculatedPrice);

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
        error instanceof Error ? error.message : "Erro desconhecido ao calcular rota"
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
      const userId = await AsyncStorage.getItem("id");
      if (!userId) {
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
          },
          body: JSON.stringify({
            sol_origem: startAddress,
            sol_destino: endAddress,
            sol_distancia: distance,
            sol_valor: price,
            sol_servico: "Moto táxi",
            // sol_status: "Pendente", // não precisa enviar se o backend seta como padrão
            usu_codigo: Number(userId),
            sol_data: new Date().toISOString(),
            sol_formapagamento: formaPagamento,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar solicitação");
      }

      router.push({
        pathname: "/PendingRequest",
        params: { solicitacaoId: data.sol_codigo }, // Changed 'id' to 'solicitacaoId'
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header />
      <StatusBar barStyle="light-content" />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Endereço de partida (ex: Rua A, 123)"
          value={startAddress}
          onChangeText={setStartAddress}
          clearButtonMode="while-editing"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Endereço de destino (ex: Av. B, 456)"
          value={endAddress}
          onChangeText={setEndAddress}
          clearButtonMode="while-editing"
          returnKeyType="done"
        />

        <View style={styles.buttonContainer}>
          <View style={{ width: 12 }} />
          <Button title="Resetar" onPress={resetForm} color="#888" />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
            <Text style={styles.loadingText}>Calculando rota...</Text>
          </View>
        )}

        {distance !== null && price !== null && (
          <>
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Distância: <Text style={styles.highlight}>{distance.toFixed(2)} km</Text>
              </Text>
              <Text style={styles.resultText}>
                Preço estimado: <Text style={styles.highlight}>R$ {price.toFixed(2)}</Text>
              </Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <Button
                title="Solicitar Moto Táxi"
                onPress={handleSolicitar}
                color="#32CD32"
                disabled={isLoading}
              />
            </View>
          </>
        )}
      </View>

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
            <Marker
              key={idx}
              coordinate={marker}
              pinColor={idx === 0 ? "green" : "red"}
            />
          ))}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#1E90FF"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#f9f9f9",
  },
  input: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555",
  },
  resultContainer: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 6,
  },
  highlight: {
    fontWeight: "bold",
    color: "#1E90FF",
  },
  mapContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    flex: 1,
  },
});
