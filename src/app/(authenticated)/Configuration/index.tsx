import { View, Text, StatusBar, Switch, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { useState, useEffect } from "react";
import styles from "./styles";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import Header from "@components/header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font/Righteous";

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
