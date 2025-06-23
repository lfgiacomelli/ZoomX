import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@components/Header";
import Tab from "@components/Tab";

import styles from "./styles";

interface Payment {
  pix_pagamento_codigo: number;
  pix_status: string;
  pix_valor: number;
  pix_data_pagamento: string;
  sol_servico: string;
  pix_criado_em: string;
}

export default function MyPaymentsApproveds() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const usu_codigo = await AsyncStorage.getItem("id");
      if (!usu_codigo) throw new Error("Usuário não autenticado");

      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/payments/get-payments/${usu_codigo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar pagamentos");
      }

      const data: Payment[] = await response.json();
      setPayments(data);

    } catch (error: any) {
      console.error("Erro ao buscar pagamentos:", error.message);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Text style={styles.statusApproved}>APROVADO</Text>;
      case "pending":
        return <Text style={styles.statusPending}>PENDENTE</Text>;
      case "rejected":
        return <Text style={styles.statusRejected}>REJEITADO</Text>;
      default:
        return <Text>{status}</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={{ fontFamily: "Righteous", fontSize: 18, color: "#000", marginTop: 15 }}>
          Carregando pagamentos...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Header />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MEUS PAGAMENTOS</Text>
        </View>

        {payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum pagamento encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui pagamentos aprovados. Volte mais tarde para verificar.
            </Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={payments}
            keyExtractor={(item) => item.pix_pagamento_codigo.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Pagamento #{item.pix_pagamento_codigo}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.pix_data_pagamento).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <View style={styles.paymentInfo}>
                  <View>
                    <Text style={{ fontFamily: "Righteous", color: "#666", marginBottom: 5 }}>
                      Status:
                    </Text>
                    {renderStatus(item.pix_status)}
                  </View>
                  <View>
                    <Text style={{ fontFamily: "Righteous", color: "#666", marginBottom: 5 }}>
                      Valor:
                    </Text>
                    <Text style={styles.amountText}>R$ {item.pix_valor.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#0066ff"]}
                tintColor="#0066ff"
                progressBackgroundColor="#ffffff"
                style={styles.refreshControl}
              />
            }
          />
        )}

        <Tab />
      </SafeAreaView>
    </>
  );
}