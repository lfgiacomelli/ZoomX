import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager, SectionList } from "react-native";
import { useEffect, useState, useRef } from "react";
import LottieView from "lottie-react-native";
import styles from "./styles";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@components/Header";
import useRighteousFont from "@hooks/Font/Righteous";

import Constants from "expo-constants";
import { router } from "expo-router";

import loadingAnimation from "@animations/loading_animation.json";
import errorAnimation from "@animations/error_animation.json";

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

interface Section {
  title: string;
  data: Atividade[];
}

export default function Travels() {
  const fontLoaded = useRighteousFont();
  const animationRef = useRef(null);
  const [data, setData] = useState<Atividade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<{sectionIndex: number, itemIndex: number} | null>(null);
  const baseURL = "https://backend-turma-a-2025.onrender.com";

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const groupByDate = (activities: Atividade[]): Section[] => {
    const grouped: {[key: string]: Atividade[]} = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.via_data);
      const dateKey = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(activity);
    });
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(b.split('/').reverse().join('-')).getTime() - 
             new Date(a.split('/').reverse().join('-')).getTime();
    });
    
    return sortedDates.map(date => ({
      title: date,
      data: grouped[date]
    }));
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
      setSections(groupByDate(json));
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

  const toggleExpand = (sectionIndex: number, itemIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prev => 
      prev?.sectionIndex === sectionIndex && prev?.itemIndex === itemIndex 
        ? null 
        : { sectionIndex, itemIndex }
    );
  };

  if (!fontLoaded) return null;

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <>
      <Header />
      <View style={styles.wrapper}>
        <SectionList
          contentContainerStyle={styles.container}
          sections={sections}
          keyExtractor={(item, index) => `${item.via_codigo}_${index}_${item.via_data}`}

          ListHeaderComponent={<Text style={styles.title}>Últimas atividades</Text>}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={
            loading && !error ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  ref={animationRef}
                  source={loadingAnimation}
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
                <Text style={styles.loadingText}>Carregando atividades...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
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
              <View style={styles.emptyContainer}>
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
          renderItem={({ item, index, section }) => {
            const isExpanded = expandedIndex?.sectionIndex === sections.indexOf(section) && 
                              expandedIndex?.itemIndex === index;
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
                onPress={() => toggleExpand(sections.indexOf(section), index)}
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
                { !isExpanded && (
                  <View style={styles.dateContainer}>
                    <Text style={styles.label}>Valor:</Text>
                    <Text style={styles.text}>R$ {item.via_valor}</Text>
                  </View>
                )}

              </TouchableOpacity>
            );
          }}
        />

      </View>
    </>
  );
}