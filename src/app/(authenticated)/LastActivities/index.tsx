import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, FlatList } from "react-native";
import { useEffect, useState, useRef } from "react";
import LottieView from "lottie-react-native";
import styles from "./styles";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@components/Header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font/Righteous";

import Constants from "expo-constants";
import { router } from "expo-router";

import loadingAnimation from "@animations/loading_animation.json";
import errorAnimation from "@animations/error_animation.json";


export default function Travels() {
  const fontLoaded = useRighteousFont();
  interface Atividade {
    via_codigo: string;
    via_funcionarioId: string;
    via_solicitacaoId?: string;
    via_usuarioId?: string;
    via_origem: string;
    via_destino: string;
    via_formapagamento?: string;
    via_observacoes?: string;
    via_atendenteCodigo?: string;
    via_servico: string;
    via_status: "Pendente" | "Aprovada" | "Rejeitada";
    via_data: string | Date;
    via_valor: number;
  }
  const animationRef = useRef(null);
  const [data, setData] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const baseURL = "https://backend-turma-a-2025.onrender.com";
  const capitalizeFirstLetter = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const usuarioId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");
      if (!usuarioId) throw new Error("ID do usuário não encontrado");

      const route = `${baseURL}/api/viagens/${usuarioId}`;
      const response = await fetch(route, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Erro de API: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  if (!fontLoaded) return null;

  return (
    <>
      <Header />
      <View style={styles.wrapper}>
        <FlatList
          contentContainerStyle={styles.container}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={<Text style={styles.title}>Últimas atividades</Text>}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading && !error ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <LottieView
                  ref={animationRef}
                  source={loadingAnimation}
                  autoPlay
                  loop
                  style={{ width: 220, height: 220 }}
                />
                <Text style={{ fontFamily: "Righteous", fontSize: 18, color: "#000" }}>
                  Carregando atividades...
                </Text>
              </View>
            ) : error ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <LottieView
                  ref={animationRef}
                  source={errorAnimation}
                  autoPlay
                  loop
                  style={styles.iconError}
                />
                <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
                <Text style={styles.errorMessage}>
                  Ocorreu um problema ao buscar suas atividades. Verifique sua conexão com a internet e tente novamente.
                </Text>
                <TouchableOpacity onPress={fetchData} style={styles.newRequest}>
                  <Text style={styles.newRequestText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image source={require("@images/empty.png")} style={styles.iconEmpty} />
                <Text style={styles.empty}>Nenhuma viagem encontrada.</Text>
                <TouchableOpacity
                  style={styles.newRequest}
                  onPress={() => router.push("/RequestTravel")}
                >
                  <Text style={styles.newRequestText}>Peça um mototáxi agora</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderItem={({ item, index }) => {
            const isExpanded = expandedIndex === index;
            const icone =
              item.via_servico === "Mototáxi"
                ? require("@images/motorcycle.png")
                : item.via_servico === "Compras"
                  ? require("@images/shopping.png")
                  : require("@images/box.png");

            const dataFormatada = item.via_data
              ? new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              }).format(new Date(item.via_data))
              : "--/--";

            return (
              <TouchableOpacity
                style={[styles.card, isExpanded && styles.cardExpanded]}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.9}
              >
                <Image source={icone} style={styles.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Serviço:</Text>
                  <Text style={styles.text}>
                    {capitalizeFirstLetter(item.via_servico) || "Indefinido"}
                  </Text>
                  {isExpanded && (
                    <>
                      <Text style={styles.detail}>Origem: {item.via_origem || "N/A"}</Text>
                      <Text style={styles.detail}>Destino: {item.via_destino || "N/A"}</Text>
                      <Text style={styles.detail}>
                        Valor: R$ {item.via_valor != null ? Number(item.via_valor).toFixed(2) : "0,00"}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          router.replace({
                            pathname: "/TravelDetails/[id]",
                            params: { id: item.via_codigo },
                          })
                        }
                        style={styles.newRequest}
                      >
                        <Text style={styles.newRequestText}>Detalhes</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <View style={styles.dateContainer}>
                  <Text style={styles.label}>Data:</Text>
                  <Text style={styles.text}>{dataFormatada}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <Tab />
      </View>
    </>
  );
}