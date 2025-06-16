import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Benefits() {
  const benefits: {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    text: string;
  }[] = [
    { icon: "shield-checkmark", text: "Motoristas verificados" },
    { icon: "time", text: "Atendimento 24 horas" },
    { icon: "cash", text: "Preços acessíveis" },
    { icon: "location", text: "Cobertura em toda a região" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nossas Vantagens</Text>
      <View style={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name={benefit.icon} size={20} color="#000" />
            </View>
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
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
});
