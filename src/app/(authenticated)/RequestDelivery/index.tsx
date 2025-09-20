import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar, TouchableOpacity, Image, Keyboard, Pressable, ScrollView, Modal } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";


import { Modalize } from "react-native-modalize";

import styles from "./styles";

import LottieView from "lottie-react-native";

import Header from "@components/Header";

import { useRouter } from "expo-router";
import { useAuth } from "@contexts/useAuth";

import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import loadingBoxAnimation from "@animations/loading_box.json";
import { mostrarDataHoraAtual } from "@utils/getDateTime";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToastMessage from "@components/ToastMessage";
import { useBatteryLevel } from "expo-battery";

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

export default function RequestDelivery() {
  const animationRef = useRef(null);

  const batteryLevel = useBatteryLevel();
  const batteryPercentage = batteryLevel ? batteryLevel * 100 : 100;
  const [startAddress, setStartAddress] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [endAddress, setEndAddress] = useState("");
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [markers, setMarkers] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [tempo, setTempo] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const modalizeRef = useRef<Modalize>(null);
  const router = useRouter();
  const { user, token } = useAuth();
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false);
  const [peso, setPeso] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [showInputs, setShowInputs] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [showToastErrorAllFields, setShowToastErrorAllFields] = useState(false);
  const [showToastErrorOrigin, setShowToastErrorOrigin] = useState(false);
  const [showToastErrorDestination, setShowToastErrorDestination] = useState(false);
  const [showToastNext, setShowToastNext] = useState(false);
  const [showToastSameAddress, setShowToastSameAddress] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showToastError, setShowToastError] = useState(false);
  const [showToastErrorUnauthorized, setShowToastErrorUnauthorized] = useState(false);

  const paymentMethods = [
    { id: "1", name: "Dinheiro", icon: "cash-outline" },
    { id: "2", name: "Cartão de Crédito", icon: "card-outline" },
    { id: "3", name: "Cartão de Débito", icon: "card-outline" },
    { id: "4", name: "PIX", icon: "qr-code-outline" },
  ];

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

      const { coords, distanceKm } = await getRouteFromOSRM(
        origin,
        destination
      );
      const hora = new Date().getHours();
      let calculatedPrice: number;

      switch (true) {
        case (hora <= 6 || hora >= 22) && batteryPercentage < 50:
          calculatedPrice = 7.5 + distanceKm * 1.2 + 0.5;
          break;

        case (hora <= 6 || hora >= 22):
          calculatedPrice = 7.5 + distanceKm * 1.2;
          break;

        case (hora > 6 && hora < 22) && batteryPercentage < 20:
          calculatedPrice = 6.5 + distanceKm * 0.9 + 0.5;
          break;

        case (hora > 6 && hora < 22) && batteryPercentage < 50:
          calculatedPrice = 6.5 + distanceKm * 0.9 + 0.3;
          break;

        case (hora > 6 && hora < 22):
          calculatedPrice = 6.5 + distanceKm * 0.9;
          break;

        default:
          calculatedPrice = 0;
      }

      setRouteCoords(coords);
      setDistance(distanceKm);
      setPrice(calculatedPrice);
      setShowInputs(false);
      const minutos = distanceKm * 2;
      setTempo(minutos);

      modalizeRef.current?.open();

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
      calcularRota();
      return;
    }

    if (!user || !token) {
      setShowToastErrorUnauthorized(true);
      return;
    }

    try {
      setLoading(true);

      const valor = Number(price.toFixed(2));
      const distancia = Number(distance.toFixed(2));

      const handleUnauthorized = async () => {
        setShowToastErrorUnauthorized(true);
        setTimeout(async () => {
          await AsyncStorage.clear();
          router.replace("/login");
        }, 2000);
      };

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
              sol_valor: valor,
              sol_descricao: "Solicitação de corrida pelo Aplicativo ZoomX",
              sol_servico: "Entrega",
              usu_codigo: Number(user.id),
              usu_nome: user.nome,
              usu_email: user.email,
              usu_cpf: user.cpf,
            }),

          }
        );

        const pagamentoData = await pagamentoResponse.json();

        if (pagamentoResponse.status === 403) {
          await handleUnauthorized();
          return;
        }

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
            distance: distancia,
            price: valor,
            comprimento,
            peso,
            largura,
            formaPagamento,
            userId: Number(user.id),
            nome: user.nome,
            email: user.email,
            shouldCreateSolicitacao: "true",
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
              sol_distancia: distancia,
              sol_valor: valor,
              sol_servico: "Entrega",
              sol_largura: Number(largura) || 0,
              sol_altura: Number(altura) || 0,
              sol_comprimento: Number(comprimento) || 0,
              sol_peso: Number(peso) || 0,
              usu_codigo: Number(user.id),
              sol_data: mostrarDataHoraAtual(),
              sol_formapagamento: formaPagamento,
              sol_observacoes: "Pedido via App",
            }),

          }

        );

        const solicitacaoData = await solicitacaoResponse.json();

        if (solicitacaoResponse.status === 403) {
          await handleUnauthorized();
          return;
        }

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

      await AsyncStorage.setItem("startAddress", startAddress);

    } catch (error: any) {
      console.error("Erro ao solicitar:", error?.message || error);
      setShowToastError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setFormaPagamento(method);
    setModalVisible(false);
  };
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setShowInputs(true);
    modalizeRef.current?.close();
  };

  const handleSaveEdit = async () => {
    setIsEditing(false);
    await calcularRota();
  };
  useEffect(() => {
    if (isEditing) return;

    const todosCamposPreenchidos =
      startAddress.trim() &&
      endAddress.trim() &&
      comprimento.trim() &&
      peso.trim() &&
      altura.trim() &&
      largura.trim();

    if (!todosCamposPreenchidos || !showInputs) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      calcularRota();
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    largura,
    startAddress,
    endAddress,
    comprimento,
    peso,
    altura,
    showInputs,
    isEditing,
  ]);

  if (isBottomSheetActive && startAddress && endAddress) {
    Keyboard.dismiss();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header />
      <StatusBar barStyle="light-content" />

      {showInputs && (
        <View style={styles.form}>
          <View style={styles.inputColumn}>
            <TextInput
              style={styles.input}
              placeholder="Endereço de retirada (ex: Rua A, 123)"
              value={startAddress}
              onChangeText={setStartAddress}
              clearButtonMode="while-editing"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço de entrega (ex: Av. B, 456)"
              value={endAddress}
              onChangeText={setEndAddress}
              clearButtonMode="while-editing"
              returnKeyType="done"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 5 }]}
                placeholder="Peso (kg)"
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 5 }]}
                placeholder="Comprimento (cm)"
                value={comprimento}
                onChangeText={setComprimento}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 5 }]}
                placeholder="Altura (cm)"
                value={altura}
                onChangeText={setAltura}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 5 }]}
                placeholder="Largura (cm)"
                value={largura}
                onChangeText={setLargura}
                keyboardType="numeric"
              />
            </View>
            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={loadingBoxAnimation}
            ref={animationRef}
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
            onPress={() => modalizeRef.current?.open()}
          >
            <Text style={styles.floatingButtonText}>Ver detalhes</Text>
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

      <Modalize
        ref={modalizeRef}
        snapPoint={400}
        adjustToContentHeight={true}
      >
        <View style={styles.bottomSheetContent}>
          {distance !== null && price !== null && (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.bottomSheetTitle}>Detalhes da Entrega</Text>
                <TouchableOpacity onPress={handleEdit}>
                  <MaterialIcons name="edit" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Origem:</Text>
                <Text style={styles.detailValue}>{startAddress}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destino:</Text>
                <Text style={styles.detailValue}>{endAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Peso:</Text>
                <Text style={styles.detailValue}>{peso} kg</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dimensões:</Text>
                <Text style={styles.detailValue}>
                  {comprimento} x {altura} x {largura} cm
                </Text>
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
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.solicitarButtonText}>
                    Solicitar Entrega
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modalize>
      {showToastError && (
        <ToastMessage
          message="Não foi possível processar a solicitação."
          status="ERROR"
          onHide={() => setShowToastError(false)}
        />
      )}
      {showToastErrorUnauthorized && (
        <ToastMessage
          message="Sessão expirada. Faça login novamente."
          status="ERROR"
          onHide={() => setShowToastErrorUnauthorized(false)}
        />
      )}
      {showToastErrorAllFields && (
        <ToastMessage
          message="Por favor, preencha todos os campos."
          status="ERROR"
          onHide={() => setShowToastErrorAllFields(false)}
        />
      )}
      {showToastErrorOrigin && (
        <ToastMessage
          message="Endereço de origem não encontrado."
          status="ERROR"
          onHide={() => setShowToastErrorOrigin(false)}
        />
      )}
      {showToastErrorDestination && (
        <ToastMessage
          message="Endereço de destino não encontrado."
          status="ERROR"
          onHide={() => setShowToastErrorDestination(false)}
        />
      )}
      {showToastNext && (
        <ToastMessage
          message="Os endereços devem estar a pelo menos 50 metros de distância."
          status="ERROR"
          onHide={() => setShowToastNext(false)}
        />
      )}
      {showToastSameAddress && (
        <ToastMessage
          message="Os endereços de partida e destino são iguais."
          status="ERROR"
          onHide={() => setShowToastSameAddress(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
