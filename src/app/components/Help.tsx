import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Help() {
    const router = useRouter();
    
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Precisa de ajuda?</Text>
      <View style={styles.contactOptions}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: "#000" }]}
          onPress={() => Linking.openURL("tel:+5511999999999")}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Ligar para suporte</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: "#000" }]}
          onPress={() => router.push("/Support")}
        >
          <Ionicons name="help-circle" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Central de ajuda</Text>
        </TouchableOpacity>
      </View>
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
  contactOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  contactButtonText: {
    color: "#fff",
    fontFamily: "Righteous",
    fontSize: 12,
    marginLeft: 8,
  },
});
