import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "@components/header";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Tab from "@components/Tab";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TravelDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [viagem, setViagem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchViagem = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const route = `https://backend-turma-a-2025.onrender.com/api/viagens/viagem/${id}`
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
        setViagem(json);
      } catch (err: any) {
        console.error("Erro ao carregar os detalhes da viagem:", err);
        setError(err.message || "Erro ao carregar os detalhes da viagem.");
      } finally {
        setLoading(false);
      }
    };

    fetchViagem();
  }, [id]);

  const generateReciboHTML = () => {
    if (!viagem) return "";

    const formattedDate = new Date(viagem.via_data).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    return `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #666; }
            .recibo-info { margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { text-align: right; }
            .separator { border-bottom: 1px solid #eee; margin: 15px 0; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            .status {
              padding: 5px 10px;
              border-radius: 4px;
              display: inline-block;
              ${
                viagem.via_status.toLowerCase() === "finalizada"
                  ? "background-color: #e8f5e9; color: #2e7d32;"
                  : viagem.via_status.toLowerCase() === "em andamento"
                    ? "background-color: #ffebee; color: #c62828;"
                    : "background-color: #fff8e1; color: #f57f17;"
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Recibo de Viagem</div>
            <div class="subtitle">Comprovante de serviço</div>
          </div>
          
          <div class="recibo-info">
            <div class="info-row">
              <span class="label">Código:</span>
              <span class="value">${id}</span>
            </div>
            <div class="info-row">
              <span class="label">Data:</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value"><span class="status">${viagem.via_status}</span></span>
            </div>
          </div>
          
          <div class="separator"></div>
          
          <div class="info-row">
            <span class="label">Origem:</span>
            <span class="value">${viagem.via_origem}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Destino:</span>
            <span class="value">${viagem.via_destino}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Serviço:</span>
            <span class="value">${viagem.via_servico}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Forma de pagamento:</span>
            <span class="value">${viagem.via_formapagamento}</span>
          </div>
          
          <div class="separator"></div>
          
          <div class="info-row">
            <span class="label">Valor:</span>
            <span class="value">R$ ${parseFloat(viagem.via_valor).toFixed(2).replace(".", ",")}</span>
          </div>
          
          <div class="total">Total: R$ ${parseFloat(viagem.via_valor).toFixed(2).replace(".", ",")}</div>
          
          <div class="footer">
            Este é um recibo gerado automaticamente pelo aplicativo.
          </div>
        </body>
      </html>
    `;
  };

  const shareRecibo = async () => {
    try {
      const html = generateReciboHTML();
      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Compartilhar Recibo",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Erro ao gerar/compartilhar recibo:", error);
      alert("Ocorreu um erro ao tentar compartilhar o recibo.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ fontFamily: "Righteous", fontSize: 18, color: "#000" }}>
          Carregando detalhes da viagem...
        </Text>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!viagem) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Viagem não encontrada.</Text>
      </View>
    );
  }

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Detalhes da Viagem</Text>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origem</Text>
            <Text style={styles.value}>{viagem.via_origem}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Destino</Text>
            <Text style={styles.value}>{viagem.via_destino}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Forma de pagamento</Text>
            <Text style={styles.value}>{viagem.via_formapagamento}</Text>
          </View>

          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Serviço</Text>
            <Text style={styles.value}>{viagem.via_servico}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>
              {new Date(viagem.via_data).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Preço</Text>
            <Text style={[styles.value, styles.price]}>
              R$ {parseFloat(viagem.via_valor).toFixed(2).replace(".", ",")}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.value,
                styles.status,
                viagem.via_status.toLowerCase() === "finalizada"
                  ? styles.statusConfirmed
                  : viagem.via_status.toLowerCase() === "em andamento"
                    ? styles.statusPending
                    : styles.statusPending,
              ]}
            >
              {viagem.via_status}
            </Text>
          </View>
        </View>
        {viagem.via_status.toLowerCase() === "finalizada" && (
          <TouchableOpacity style={styles.shareButton} onPress={shareRecibo}>
            <Text style={styles.shareButtonText}>Compartilhar Recibo</Text>
          </TouchableOpacity>
        )}
        {viagem.via_status.toLowerCase() === "em andamento" && (
          <View style={styles.shareButton}>
            <Text style={styles.shareButtonText}>
              Aguarde a finalização da viagem.
            </Text>
          </View>
        )}
      </ScrollView>
      <Tab />
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorText: {
    fontFamily: "Righteous",
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  notFoundText: {
    fontFamily: "Righteous",
    color: "#000",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 22,
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  value: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  price: {
    color: "#2e7d32",
    fontFamily: "Righteous",
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: "center",
    overflow: "hidden",
  },
  statusConfirmed: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  statusPending: {
    backgroundColor: "#ffebee",
    color: "#f57f17",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  shareButton: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    fontFamily: "Righteous",
    color: "#fff",
    fontSize: 16,
  },
});
