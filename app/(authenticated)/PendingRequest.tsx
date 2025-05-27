import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from 'expo-av';
import Header from "../Components/header";

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

  useEffect(() => {
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/notificacao.mp3')
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

      const response = await fetch(`https://backend-turma-a-2025.onrender.com/api/solicitacoes/${id}`);
      if (!response.ok) throw new Error(`Erro ao buscar solicitação: ${response.status}`);

      const data = await response.json();

      if (previousStatus.current && previousStatus.current !== data.sol_status) {
        playSound();
      }

      previousStatus.current = data.sol_status;
      setSolicitacao(data);

      if (data.sol_status === "aceita") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        try {
          const solicitacaoId = data.sol_codigo;

          const responseFuncionario = await fetch(`https://backend-turma-a-2025.onrender.com/api/viagens/solicitacao/${solicitacaoId}/funcionario`);

          if (!responseFuncionario.ok) {
            throw new Error(`Erro ao buscar informações do funcionário: ${responseFuncionario.status}`);
          }

          const responseJson = await responseFuncionario.json();
          const funcionario = responseJson.funcionario;
          setMototaxista(funcionario);
          setShowModal(true);

        } catch (error) {
          console.error("Erro ao buscar informações do funcionário:", error);
          Alert.alert(
            "Erro",
            "Não foi possível carregar as informações do mototaxista no momento.",
            [{ text: "OK" }]
          );
        }

      }
      else if (data.sol_status === "recusada") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setShowRecusaModal(true);
      }


    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`https://backend-turma-a-2025.onrender.com/api/solicitacoes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Erro ao cancelar solicitação: ${response.status}`);

      Alert.alert(
        "Solicitação Cancelada",
        "Sua solicitação foi cancelada com sucesso",
        [{ text: "OK", onPress: () => router.push("/home") }]
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
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <Text style={styles.noRequestText}>Nenhuma solicitação encontrada.</Text>
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
            Sua solicitação está sendo analisada. Aguarde a confirmação do atendente.
          </Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tempo para cancelamento:</Text>
            <Text style={[
              styles.timerValue,
              timeLeft < 60 && styles.warningTime
            ]}>
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
              <Text style={styles.detailValue}>{solicitacao.sol_distancia} km</Text>
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
              <Text style={[
                styles.detailValue,
                solicitacao.sol_status === "Pendente" ? styles.pendingStatus : styles.acceptedStatus
              ]}>
                {solicitacao.sol_status}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data:</Text>
              <Text style={styles.detailValue}>{new Date(solicitacao.sol_data).toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pagamento:</Text>
              <Text style={styles.detailValue}>{solicitacao.sol_formapagamento}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.actionButton,
              cancelDisabled && styles.disabledButton
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
          animationType="slide"
          transparent={true}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={require("../../assets/aceito.png")} style={{ width: 100, height: 100, marginBottom: 20 }} />
              <Text style={styles.modalTitle}>Corrida Aceita!</Text>
              <Text style={styles.modalText}>
                Seu mototaxista está a caminho!Aguarde no local indicado{"\n\n"}
                <Text style={styles.bold}>Nome:</Text> {mototaxista?.fun_nome}{"\n"}
                <Text style={styles.bold}>Moto:</Text> {mototaxista?.mot_modelo}{"\n"}
                <Text style={styles.bold}>Placa:</Text> {mototaxista?.mot_placa}
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowModal(false);
                  router.push("/home");
                }}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRecusaModal}
          onRequestClose={() => setShowRecusaModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image source={require("../../assets/recusado.png")} style={{ width: 100, height: 100, marginBottom: 20 }} />
              <Text style={styles.modalTitle}>Solicitação Recusada</Text>
              <Text style={styles.modalText}>
                Infelizmente, sua solicitação foi recusada.{"\n\n"}
                Veja possíveis motivos e tente novamente.
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity
                  style={[styles.modalButton, { flex: 1, marginRight: 5 }]}
                  onPress={() => {
                    setShowRecusaModal(false);
                    router.push("/home");
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
    backgroundColor: '#f0f0f0',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  atendenteImage: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#000',
  },
  timerContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  timerValue: {
    fontFamily: 'Righteous',
    fontSize: 24,
    color: '#000',
  },
  warningTime: {
    color: '#FF3B30',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  detailValue: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
  pendingStatus: {
    color: '#FF9500',
    fontWeight: 'bold',
  },
  acceptedStatus: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#AEAEB2',
  },
  actionButtonText: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#fff',
  },
  loadingText: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#000',
    marginTop: 20,
  },
  errorText: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  noRequestText: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#000',
  },
  retryButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '70%',
  },
  retryButtonText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#fff',
  },
  message: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Righteous',
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
  },
  modalText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: 'Righteous',
  },
  modalButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#fff',
  },

});