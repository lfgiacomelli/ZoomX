import { View, Text, StatusBar, Switch, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { useState, useEffect, useRef } from "react";
import styles from "./styles";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import Header from "@components/Header";
import useRighteousFont from "@hooks/useFont/Righteous";

import { FontAwesome6, MaterialCommunityIcons, Entypo, EvilIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";

import locationAnimation from "@animations/location_animation.json";
import notificationAnimation from "@animations/notification_animation.json";
import { BottomSheet } from "@components/BottomSheet";

export default function SettingsScreen() {
  const router = useRouter();
  const fontLoaded = useRighteousFont();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const bottomSheetRef = useRef<Modalize>(null);
  const bottomSheetNotificationRef = useRef<Modalize>(null);

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
      bottomSheetNotificationRef.current?.open();
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    }
  };

  const toggleLocation = async () => {
    if (locationEnabled) {
      bottomSheetRef.current?.open();
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationEnabled(status === "granted");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
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
          <TouchableOpacity style={styles.whiteButton} onPress={() => router.push('/Support')}>
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
            trackColor={{ false: "#ccc", true: "#000" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Localização</Text>
          <Switch
            value={locationEnabled}
            onValueChange={toggleLocation}
            trackColor={{ false: "#ccc", true: "#000" }}
            thumbColor="#fff"
          />
        </View>
        <TouchableOpacity
          style={styles.switchContainer}
          onPress={() => router.push("/AboutApp")}
          accessibilityRole="button"
          accessibilityLabel="Informações sobre o aplicativo"
        >
          <Text style={styles.switchText}>Veja sobre o APP</Text>
          <EvilIcons name="chevron-right" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        title="Desativar Localização"
        text="Para desativar a permissão de localização, vá até as configurações do aplicativo."
        action={openAppSettings}
        animation={locationAnimation}
        buttonTitle="Ir para Configurações"
      />
      <BottomSheet
        ref={bottomSheetNotificationRef}
        title="Desativar Notificações"
        text="Para desativar a permissão de notificações, vá até as configurações do aplicativo."
        action={openAppSettings}
        animation={notificationAnimation}
        buttonTitle="Ir para Configurações"
      />
    </>
  );
}
