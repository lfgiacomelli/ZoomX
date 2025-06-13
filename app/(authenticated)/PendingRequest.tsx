import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import Header from "../Components/header";
import * as Notifications from "expo-notifications";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [timeLeft, setTimeLeft] = useState(300);
  const [cancelDisabled, setCancelDisabled] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const previousStatus = useRef<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mototaxista, setMototaxista] = useState<any>(null);
  const [showRecusaModal, setShowRecusaModal] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationRef = useRef(null);
  useEffect(() => {
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/notificacao.mp3")
      );
      setSound(sound);
    }

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

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

      // Pega o token e usuário uma vez só no início
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("id");

      if (!token || !userId) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setLoading(false);
        return;
      }

      // Busca a solicitação passando token no header Authorization
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
            source={require("../../assets/atendente.png")}
            style={styles.atendenteImage}
          />
          <Text style={styles.message}>
            Sua solicitação está sendo analisada. Aguarde a confirmação do
            atendente.
          </Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo para cancelamento:</Text>
            <LottieView
              source={require("../../assets/timer_animation.json")}
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
              <LottieView
                ref={animationRef}
                source={
                  solicitacao?.sol_servico === "Entrega"
                    ? require("../../assets/box_animation.json")
                    : solicitacao?.sol_servico === "Mototáxi"
                      ? require("../../assets/motor_animation.json")
                      : solicitacao?.sol_servico === "Compras"
                        ? require("../../assets/request_market_accepted.json")
                        : null
                }
                autoPlay
                loop
                style={styles.lottie}
              />

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
                source={require("../../assets/recusado.png")}
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  atendenteImage: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#000",
  },
  timerContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  timerLabel: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  timerValue: {
    fontFamily: "Righteous",
    fontSize: 24,
    color: "#000",
  },
  warningTime: {
    color: "#FF3B30",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  detailValue: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#555",
    flex: 1,
    textAlign: "right",
  },
  pendingStatus: {
    color: "#FF9500",
    fontFamily: "Righteous",
  },
  acceptedStatus: {
    color: "#34C759",
    fontFamily: "Righteous",
  },
  actionButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#AEAEB2",
  },
  actionButtonText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#fff",
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
    marginTop: 20,
  },
  errorText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  noRequestText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
  },
  retryButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "70%",
  },
  retryButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  message: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 10,
  },
  modalText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  bold: {
    fontFamily: "Righteous",
  },
  modalButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  lottie: {
    width: 230,
    height: 230,
    marginBottom: 10,
  },
});
