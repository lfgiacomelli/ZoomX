import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar, TouchableOpacity, Image, ScrollView, AccessibilityInfo, Modal, Pressable, Keyboard } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles";

import LottieView from "lottie-react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import Header from "@components/Header";

import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import loadingMotorcycleAnimation from "@animations/loading_motorcycle.json";

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

const paymentMethods = [
  { id: "1", name: "Dinheiro", icon: "cash-outline" },
  { id: "2", name: "Cartão de Crédito", icon: "card-outline" },
  { id: "3", name: "Cartão de Débito", icon: "card-outline" },
  { id: "4", name: "PIX", icon: "qr-code-outline" },
];

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
  const [statusLeitor, setStatusLeitor] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");
      const nome = await AsyncStorage.getItem("nome");
      const cpf = await AsyncStorage.getItem("cpf");
      const email = await AsyncStorage.getItem("email");

      if (!userId || !token || !nome || !email || !cpf) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      setIsLoading(true);

      if (formaPagamento?.toLowerCase() === "pix") {
        const pagamentoResponse = await fetch(
          "https://backend-turma-a-2025.onrender.com/api/payments/create-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sol_valor: Number(price.toFixed(2)),
              sol_descricao: "Solicitação de corrida pelo Aplicativo ZoomX ",
              sol_servico: "Mototáxi",
              usu_codigo: Number(userId),
              usu_nome: nome,
              usu_cpf: cpf,
              usu_email: email,
            }),
          }
        );

        const pagamentoData = await pagamentoResponse.json();

        if (!pagamentoResponse.ok) {
          throw new Error(pagamentoData.error || "Erro ao gerar pagamento.");
        }

        router.push({
          pathname: "/PaymentPending",
          params: {
            paymentId: pagamentoData.id,
            qrCode: pagamentoData.qr_code,
            qrCodeBase64: pagamentoData.qr_code_base64,
            startAddress,
            endAddress,
            distance: Number(distance.toFixed(2)),
            price: Number(price.toFixed(2)),
            formaPagamento,
            userId: Number(userId),
            nome,
            cpf,
            email,
            shouldCreateSolicitacao: "true"
          },
        });

      } else {
        const solicitacaoResponse = await fetch(
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
              sol_distancia: Number(distance.toFixed(2)),
              sol_valor: Number(price.toFixed(2)),
              sol_servico: "Mototáxi",
              usu_codigo: Number(userId),
              sol_data: new Date().toISOString(),
              sol_formapagamento: formaPagamento,
              sol_observacoes: "Pedido via App",
            }),
          }
        );

        const solicitacaoData = await solicitacaoResponse.json();

        if (!solicitacaoResponse.ok) {
          throw new Error(solicitacaoData.message || "Erro ao criar solicitação.");
        }

        router.push({
          pathname: "/PendingRequest",
          params: {
            solicitacaoId: solicitacaoData.sol_codigo,
          },
        });
      }
    } catch (error) {
      console.error("Erro ao solicitar corrida:", error);
      Alert.alert("Erro", "Não foi possível processar a solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkScreenReader = async () => {
    const status = await AccessibilityInfo.isScreenReaderEnabled();
    setStatusLeitor(status);
  };

  useEffect(() => {
    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setStatusLeitor
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isBottomSheetActive && startAddress && endAddress) {
      Keyboard.dismiss();
    }
  }, [isBottomSheetActive, startAddress, endAddress]);

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

  const handlePaymentMethodSelect = (method: string) => {
    setFormaPagamento(method);
    setModalVisible(false);
  };
  const renderLupa = () => {
    if (endAddress) {
      return (
        <TouchableOpacity
          style={[styles.lupaContainer, isPressed && styles.lupaButtonPressed]}
          onPress={calcularRota}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.lupaText, isPressed && styles.lupaTextPressed]}>
            Ver trajeto
          </Text>
          <Ionicons
            name="search"
            size={20}
            color={isPressed ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      );
    }
    return null;
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
          <View style={styles.row}>{renderLupa()}</View>
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={animationRef}
            source={loadingMotorcycleAnimation}
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
                    ? require("@images/partida.png")
                    : require("@images/destino.png")
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

              <View style={styles.paymentMethodContainer}>
                <Text style={styles.paymentMethodLabel}>
                  Forma de Pagamento:
                </Text>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.paymentMethodButtonText}>
                    {formaPagamento}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                      Selecione a forma de pagamento
                    </Text>

                    <ScrollView style={styles.paymentMethodsList}>
                      {paymentMethods.map((method) => (
                        <Pressable
                          key={method.id}
                          style={({ pressed }) => [
                            styles.paymentMethodItem,
                            pressed && styles.paymentMethodItemPressed,
                            formaPagamento === method.name &&
                            styles.paymentMethodItemSelected,
                          ]}
                          onPress={() => handlePaymentMethodSelect(method.name)}
                        >
                          <Ionicons
                            name={method.icon as any}
                            size={24}
                            color={
                              formaPagamento === method.name ? "#000" : "#666"
                            }
                          />
                          <Text
                            style={[
                              styles.paymentMethodText,
                              formaPagamento === method.name &&
                              styles.paymentMethodTextSelected,
                            ]}
                          >
                            {method.name}
                          </Text>
                          {formaPagamento === method.name && (
                            <Ionicons name="checkmark" size={20} color="#000" />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.modalCloseButtonText}>Fechar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

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
