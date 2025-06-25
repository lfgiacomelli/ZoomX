import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
} from "react-native";
import styles from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@components/Header";
import Tab from "@components/Tab";

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

  const fetchPayments = useCallback(async () => {
    try {
      const usu_codigo = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!usu_codigo || !token) throw new Error("Usuário não autenticado");

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
        return;
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
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Text style={styles.statusApproved}>APROVADO</Text>;
      case "pending":
        return <Text style={styles.statusPending}>PENDENTE</Text>;
      case "rejected":
        return <Text style={styles.statusRejected}>REJEITADO</Text>;
      default:
        return <Text style={styles.statusUnknown}>{status}</Text>;
    }
  };

  const renderItem = ({ item }: { item: Payment }) => (
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
      <View style={styles.cardBody}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Status</Text>
          {renderStatus(item.pix_status)}
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Valor</Text>
          <Text style={styles.amountText}>R$ {item.pix_valor.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Header />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Meus Pagamentos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Carregando pagamentos...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={require("@images/empty.png")} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>Nenhum pagamento encontrado</Text>
          <Text style={styles.emptyText}>
            Você ainda não possui pagamentos aprovados. Volte mais tarde para verificar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.pix_pagamento_codigo.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0066ff"]}
              tintColor="#0066ff"
              progressBackgroundColor="#ffffff"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <Tab />
    </>
  );
}

// styles.ts