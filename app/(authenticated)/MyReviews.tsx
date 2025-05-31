import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/header";
import Tab from "../Components/Tab";

interface Avaliacao {
  ava_codigo: string;
  via_codigo: string;
  ava_nota: number;
  ava_comentario: string;
  ava_data_avaliacao: string;
}

const MyReviews = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvaliacoes = async () => {
    try {
      const usu_codigo = await AsyncStorage.getItem("id");
      if (!usu_codigo) throw new Error("Usuário não autenticado");

      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/avaliacoes/usuario/${usu_codigo}`
      );
      const data = await response.json();
      setAvaliacoes(data);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAvaliacoes();
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontFamily: "Righteous", fontSize: 18, color: "#000" }}>
          Carregando avaliações...
        </Text>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const renderStars = (nota: number) => {
    return "⭐".repeat(nota);
  };

  return (
    <>
      <Header />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MINHAS AVALIAÇÕES</Text>
        </View>

        {avaliacoes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../../assets/empty_reviews.png")}
              style={{ width: 300, height: 300, marginTop: -110 }}
            />
            <Text style={styles.emptyTitle}>Nenhuma avaliação encontrada</Text>
            <Text style={styles.emptyText}>
              Você ainda não avaliou nenhuma viagem
            </Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={avaliacoes}
            keyExtractor={(item) => item.ava_codigo}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    Viagem #{item.via_codigo}
                  </Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.ava_data_avaliacao).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </Text>
                </View>

                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>Avaliação:</Text>
                  <Text style={styles.ratingStars}>
                    {renderStars(item.ava_nota)}
                  </Text>
                </View>

                {item.ava_comentario && (
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentLabel}>Seu comentário:</Text>
                    <Text style={styles.commentText}>
                      {item.ava_comentario}
                    </Text>
                  </View>
                )}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}
        <Tab />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontFamily: "Righteous",
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  cardTitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
  },
  cardDate: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
    marginRight: 8,
  },
  ratingStars: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#FFD700",
  },
  commentContainer: {
    marginTop: 8,
  },
  commentLabel: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  commentText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default MyReviews;
