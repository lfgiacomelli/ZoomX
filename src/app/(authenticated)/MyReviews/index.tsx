import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles";

import Header from "@components/Header";
import Tab from "@components/Tab";


interface Avaliacao {
    ava_codigo: string;
    via_codigo: string;
    ava_nota: number;
    ava_comentario: string;
    ava_data_avaliacao: string;
}

export default function MyReviews() {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAvaliacoes = async () => {
        try {
            const usu_codigo = await AsyncStorage.getItem("id");
            if (!usu_codigo) throw new Error("Usuário não autenticado");

            const response = await fetch(
                `https://backend-turma-a-2025.onrender.com/api/avaliacoes/usuario/${usu_codigo}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
                    },
                }
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
                            source={require("@images/empty_reviews.png")}
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
