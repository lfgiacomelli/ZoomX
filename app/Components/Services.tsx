import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
export default function Services() {
  const router = useRouter();
  const services = [
    {
      id: 1,
      title: "Mototáxi",
      icon: require("../../assets/motorcycle.png"),
      description: "Viagens rápidas pela cidade",
      action: () => router.push("/RequestTravel"),
      color: "#FF6B00",
    },
    {
      id: 2,
      title: "Entregas",
      icon: require("../../assets/box.png"),
      description: "Envie seus pacotes com segurança",
      action: () => router.push("/RequestDelivery"),
      color: "#00A859",
    },
    {
      id: 3,
      title: "Compras",
      icon: require("../../assets/shopping.png"),
      description: "Faça suas compras sem sair de casa",
      action: () => router.push("/RequestMarket"),
      color: "#2D9CDB",
    },
    {
      id: 4,
      title: "Urgências",
      icon: require("../../assets/emergency.png"),
      description: "Transporte rápido para emergências",
      action: () => router.push("/RequestTravel"),
      color: "#EB5757",
    },
  ];
  const hora = new Date().getHours();
  if (hora < 8 || hora > 20) {
    services.splice(2, 1);
    services.splice(2, 1);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>O que você precisa?</Text>
      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, { borderTopColor: service.color }]}
            onPress={service.action}
            accessible={true}
            accessibilityLabel={service.title}
            accessibilityHint={`Clique para solicitar serviço de ${service.title}`}
          >
            <View style={styles.serviceIconContainer}>
              <Image
                source={service.icon}
                style={styles.serviceIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.mainActionButton}
        onPress={() => router.push("/RequestTravel")}
        accessible={true}
        accessibilityLabel="Solicitar Mototáxi"
        accessibilityHint="Clique para solicitar um mototáxi agora"
      >
        <Image
          source={require("../../assets/motorcycle.png")}
          style={styles.serviceIcon}
        />
        <Text style={styles.mainActionText}>SOLICITAR AGORA</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 16,
  },
  seeMore: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderTopWidth: 4,
    borderColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  serviceTitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
    textAlign: "center",
  },
  serviceDescription: {
    fontFamily: "Righteous",
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  mainActionButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 18,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Righteous",
    marginLeft: 12,
  },
  mainActionIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
});
