import { View, Text, StyleSheet, StatusBar, Switch, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import Header from "@components/header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font";

import { FontAwesome6, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const fontLoaded = useRighteousFont();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(notifStatus === "granted");

    const { status: locStatus } =
      await Location.getForegroundPermissionsAsync();
    setLocationEnabled(locStatus === "granted");
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      Alert.alert(
        "Permissão de Notificações",
        "Para desativar as notificações, vá até as configurações do aplicativo.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir Configurações", onPress: openAppSettings },
        ]
      );
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    }
  };

  const toggleLocation = async () => {
    if (locationEnabled) {
      Alert.alert(
        "Permissão de Localização",
        "Para desativar a localização, vá até as configurações do aplicativo.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir Configurações", onPress: openAppSettings },
        ]
      );
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === "granted");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("nome");
    await AsyncStorage.removeItem("email");
    await AsyncStorage.removeItem("telefone");
    await AsyncStorage.removeItem("criado_em");
    await AsyncStorage.removeItem("startAddress");
    console.log("Usuário deslogado com sucesso");
    router.replace("/login");
  };

  if (!fontLoaded) return null;

  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configurações do APP</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.whiteButton} onPress={() =>router.push('/Support')}>
            <FontAwesome6 name="users-gear" size={24} color="black" />
            <Text style={styles.whiteButtonText}>Suporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whiteButton}>
            <Entypo name="phone" size={16} color="#000" />
            <Text style={styles.whiteButtonText}>Contato</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Notificações</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#ccc", true: "#48d16f" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Localização</Text>
          <Switch
            value={locationEnabled}
            onValueChange={toggleLocation}
            trackColor={{ false: "#ccc", true: "#48d16f" }}
            thumbColor="#fff"
          />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
      <Tab />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 24,
    marginBottom: 24,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  whiteButton: {
    height: 40,
    width: 172,
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    padding: 8,
  },
  whiteButtonText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },
  switchContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  switchText: {
    fontFamily: "Righteous",
    fontSize: 24,
    color: "#000",
    marginLeft: 8,
  },
  deactivateButton: {
    height: 45,
    backgroundColor: "#007BFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: 20,
    gap: 8,
    elevation: 3,
  },
  deactivateText: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "#DB2E05",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: 12,
    gap: 8,
    elevation: 3,
    height: 45,
  },
  logoutText: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#fff",
  },
});
