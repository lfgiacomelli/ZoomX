import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LottieView from "lottie-react-native";

import Header from "@components/Header";

import { useRouter, useLocalSearchParams } from "expo-router";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import styles from "./styles";

import boxAnimation from "@animations/box_animation.json";
import motorAnimation from "@animations/motor_animation.json";
import requestMarketAccepted from "@animations/request_market_accepted.json";
import timerAnimation from "@animations/timer_animation.json";

type Solicitacao = {
  sol_codigo: number;
  sol_origem: string;
  sol_destino: string;
  sol_distancia: number;
  sol_valor: number;
  sol_servico: string;
  sol_status: string;
  sol_data: string;
  sol_formapagamento: string;
  usu_codigo?: number;
};

export default function PendingRequest() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = Number(params.solicitacaoId);

  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [cancelDisabled, setCancelDisabled] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const previousStatus = useRef<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mototaxista, setMototaxista] = useState<any>(null);
  const [showRecusaModal, setShowRecusaModal] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef(null);

  const playSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir som:", error);
    }
  };

  const fetchSolicitacao = async () => {
    if (!id || isNaN(id)) {
      setError("ID inválido para buscar solicitação");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("id");

      if (!token || !userId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/solicitacoes/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`Erro ao buscar solicitação: ${response.status}`);

      const data = await response.json();

      if (
        previousStatus.current &&
        previousStatus.current !== data.sol_status
      ) {
        playSound();
      }
      previousStatus.current = data.sol_status;

      setSolicitacao(data);

      if (data.sol_status === "aceita") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        try {
          const solicitacaoId = data.sol_codigo;

          const responseFuncionario = await fetch(
            `https://backend-turma-a-2025.onrender.com/api/viagens/solicitacao/${solicitacaoId}/funcionario`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!responseFuncionario.ok) {
            throw new Error(
              `Erro ao buscar informações do funcionário: ${responseFuncionario.status}`
            );
          }

          const responseJson = await responseFuncionario.json();
          const funcionario = responseJson.funcionario;

          setMototaxista(funcionario);
          setShowModal(true);

          setTimeout(async () => {
            const distancia = data.sol_distancia;
            const tempoBase = 15;
            let tempo;

            if (data.sol_servico === "Compras") {
              tempo = tempoBase + Math.ceil(distancia * 2);
            } else {
              tempo = Math.ceil(distancia * 2.3);
            }

            const mensagemBase = ` ${funcionario.fun_nome} será `;
            const veiculoInfo = `\nMoto: ${funcionario.mot_modelo} - Placa: ${funcionario.mot_placa}`;
            let mensagemFinal = "";

            if (data.sol_servico === "Entrega") {
              mensagemFinal = `${mensagemBase}seu entregador! Aguarde no local indicado.${veiculoInfo}\nEle chegará em ${tempo} minutos`;
            } else if (data.sol_servico === "Mototáxi") {
              mensagemFinal = `${mensagemBase}seu mototaxista! Aguarde no local indicado.${veiculoInfo}\nEle chegará em ${tempo} minutos`;
            } else if (data.sol_servico === "Compras") {
              mensagemFinal = `${mensagemBase}responsável por suas compras! Aguarde no local indicado.${veiculoInfo}\nTempo estimado de entrega: ${tempo} minutos`;
            }

            await Notifications.scheduleNotificationAsync({
              content: {
                title:
                  data.sol_servico === "Entrega"
                    ? "Sua entrega foi aceita!"
                    : data.sol_servico === "Compras"
                      ? "Sua solicitação de compras foi aceita!"
                      : "Sua corrida foi aceita!",
                body: mensagemFinal,
                data: { solicitacaoId },
              },
              trigger: null,
            });
          }, 3000);
        } catch (error) {
          console.error("Erro ao buscar informações do funcionário:", error);
          Alert.alert(
            "Erro",
            "Não foi possível carregar as informações do mototaxista no momento.",
            [{ text: "OK" }]
          );
        }
      } else if (data.sol_status === "recusada") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setShowRecusaModal(true);

        setTimeout(async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Solicitação recusada",
              body: "Infelizmente sua solicitação foi recusada.",
            },
            trigger: null,
          });
        }, 3000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erro desconhecido");
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/solicitacoes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        }
      );
      await AsyncStorage.removeItem("startAddress");
      if (!response.ok)
        throw new Error(`Erro ao cancelar solicitação: ${response.status}`);

      Alert.alert(
        "Solicitação Cancelada",
        "Sua solicitação foi cancelada com sucesso",
        [{ text: "OK", onPress: () => router.push("/Home") }]
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao cancelar solicitação");
    }
  };

  useEffect(() => {
    fetchSolicitacao();

    countdownRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownRef.current!);
          setCancelDisabled(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    intervalRef.current = setInterval(() => {
      fetchSolicitacao();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            setSolicitacao(null);
            fetchSolicitacao();
          }}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!solicitacao) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Carregando solicitação...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Image
            source={require("@images/atendente.png")}
            style={styles.atendenteImage}
          />
          <Text style={styles.message}>
            Sua solicitação está sendo analisada. Aguarde a confirmação do
            atendente.
          </Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo para cancelamento:</Text>
            <LottieView
              source={timerAnimation}
              autoPlay
              loop
              style={{ width: 50, height: 50, marginBottom: 10 }}
            />
            <Text
              style={[styles.timerValue, timeLeft < 60 && styles.warningTime]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Origem:</Text>
              <Text style={styles.detailValue}>{solicitacao.sol_origem}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destino:</Text>
              <Text style={styles.detailValue}>{solicitacao.sol_destino}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distância:</Text>
              <Text style={styles.detailValue}>
                {solicitacao.sol_distancia} km
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preço:</Text>
              <Text style={styles.detailValue}>R$ {solicitacao.sol_valor}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Serviço:</Text>
              <Text style={styles.detailValue}>{solicitacao.sol_servico}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text
                style={[
                  styles.detailValue,
                  solicitacao.sol_status === "Pendente"
                    ? styles.pendingStatus
                    : styles.acceptedStatus,
                ]}
              >
                {solicitacao.sol_status}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>
                {new Date(solicitacao.sol_data).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pagamento:</Text>
              <Text style={styles.detailValue}>
                {solicitacao.sol_formapagamento}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              cancelDisabled && styles.disabledButton,
            ]}
            onPress={handleCancel}
            disabled={cancelDisabled}
          >
            <Text style={styles.actionButtonText}>
              {cancelDisabled ? "Tempo esgotado" : "Cancelar Solicitação"}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {(
                solicitacao?.sol_servico === "Entrega" ||
                solicitacao?.sol_servico === "Mototáxi" ||
                solicitacao?.sol_servico === "Compras"
              ) && (
                <LottieView
                  ref={animationRef}
                  source={
                    solicitacao?.sol_servico === "Entrega"
                      ? boxAnimation
                      : solicitacao?.sol_servico === "Mototáxi"
                        ? motorAnimation
                        : requestMarketAccepted
                  }
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              )}

              <Text style={styles.modalTitle}>
                {solicitacao?.sol_servico === "Entrega"
                  ? "Entrega Aceita!"
                  : solicitacao?.sol_servico === "Mototáxi"
                    ? "Corrida Aceita!"
                    : solicitacao?.sol_servico === "Compras"
                      ? "Compra Aceita!"
                      : ""}
              </Text>

              <Text style={styles.modalText}>
                {solicitacao?.sol_servico === "Entrega"
                  ? "Seu entregador está a caminho! Aguarde no local indicado"
                  : solicitacao?.sol_servico === "Mototáxi"
                    ? "Seu mototaxista está a caminho! Aguarde no local indicado"
                    : solicitacao?.sol_servico === "Compras"
                      ? "Estamos realizando sua compra. Em breve ela chegará!"
                      : ""}
                {"\n\n"}
                <Text style={styles.bold}>Nome:</Text> {mototaxista?.fun_nome}
                {"\n"}
                <Text style={styles.bold}>
                  {solicitacao?.sol_servico === "Entrega"
                    ? "Veículo:"
                    : "Moto:"}
                </Text>{" "}
                {mototaxista?.mot_modelo}
                {"\n"}
                <Text style={styles.bold}>Placa:</Text> {mototaxista?.mot_placa}
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowModal(false);
                  router.push("/Home");
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRecusaModal}
          onRequestClose={() => setShowRecusaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image
                source={require("@images/recusado.png")}
                style={{ width: 100, height: 100, marginBottom: 20 }}
              />
              <Text style={styles.modalTitle}>Solicitação Recusada</Text>
              <Text style={styles.modalText}>
                Infelizmente, sua solicitação foi recusada.{"\n\n"}
                Veja possíveis motivos e tente novamente.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  style={[styles.modalButton, { flex: 1, marginRight: 5 }]}
                  onPress={() => {
                    setShowRecusaModal(false);
                    router.push("/Home");
                  }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { flex: 1, marginLeft: 5 }]}
                  onPress={() => {
                    setShowRecusaModal(false);
                    router.push("/motivos");
                  }}
                >
                  <Text style={styles.modalButtonText}>Ver Motivos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}