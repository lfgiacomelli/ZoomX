import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  Pressable,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  Entypo,
  MaterialCommunityIcons,
  Octicons,
  EvilIcons,
  Ionicons,
} from "@expo/vector-icons";

import Header from "@components/header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font/Righteous";

import styles from "./styles";

type UserData = {
  username: string;
  email: string;
  since: string;
  telefone: string;
};

export default function Profile() {
  const router = useRouter();
  const fontLoaded = useRighteousFont();

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    username: "Usuário",
    email: "",
    since: "Desconhecido",
    telefone: "Desconhecido",
  });

  const [loadingUserData, setLoadingUserData] = useState(true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    loadUserPhoto();
    loadUserDataFromStorageAndUpdate();
  }, []);

  // Carrega foto do AsyncStorage
  async function loadUserPhoto() {
    try {
      const photoUri = await AsyncStorage.getItem("userPhoto");
      if (photoUri) setUserPhoto(photoUri);
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  }

  // Carrega dados do AsyncStorage e depois atualiza do backend
  async function loadUserDataFromStorageAndUpdate() {
    try {
      // Primeiro carrega do AsyncStorage para exibir rápido
      const storedUsername = (await AsyncStorage.getItem("nome")) || "Usuário";
      const storedEmail = (await AsyncStorage.getItem("email")) || "";
      const storedTelefone =
        (await AsyncStorage.getItem("telefone")) || "Desconhecido";
      const storedSince =
        (await AsyncStorage.getItem("criado_em")) || "Desconhecido";

      setUserData({
        username: storedUsername,
        email: storedEmail,
        telefone: storedTelefone,
        since: storedSince,
      });

      // Agora atualiza do backend
      await fetchUsuarioAndUpdateStorage();

    } catch (error) {
      console.error("Erro ao carregar dados do AsyncStorage:", error);
      setLoadingUserData(false);
    }
  }

  // Busca dados do usuário no backend e atualiza AsyncStorage e estado
  async function fetchUsuarioAndUpdateStorage() {
    try {
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!userId || !token) {
        console.error("ID ou token não encontrados");
        setLoadingUserData(false);
        return;
      }

      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/usuarios/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");

      const data = await response.json();

      // Formata data de criação
      const sinceFormatted = data.usu_created_at
        ? new Date(data.usu_created_at).toLocaleDateString()
        : "Desconhecido";

      // Atualiza estado
      setUserData({
        username: data.usu_nome || "Usuário",
        email: data.usu_email || "",
        telefone: data.usu_telefone || "Desconhecido",
        since: sinceFormatted,
      });

      // Atualiza AsyncStorage para futuras consultas rápidas
      await AsyncStorage.multiSet([
        ["nome", data.usu_nome || "Usuário"],
        ["email", data.usu_email || ""],
        ["telefone", data.usu_telefone || "Desconhecido"],
        ["criado_em", sinceFormatted],
      ]);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setLoadingUserData(false);
    }
  }

  async function handleChoosePhoto() {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Precisamos de permissão para acessar suas fotos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        await AsyncStorage.setItem("userPhoto", uri);
        setUserPhoto(uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
    }
  }

  async function handleRemovePhoto() {
    setShowPhotoModal(false);
    try {
      await AsyncStorage.removeItem("userPhoto");
      setUserPhoto(null);
    } catch (error) {
      console.error("Erro ao remover foto:", error);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const keysToRemove = [
        "token",
        "id",
        "nome",
        "email",
        "telefone",
        "criado_em",
        "startAddress",
        "userPhoto",
      ];
      await AsyncStorage.multiRemove(keysToRemove);
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!fontLoaded || loadingUserData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Perfil e Foto */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={() => setShowPhotoModal(true)}
            style={styles.photoContainer}
            accessibilityLabel="Editar foto de perfil"
          >
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.profilePhoto} />
            ) : (
              <Ionicons name="person" size={80} color="#000" />
            )}
            <View style={styles.editPhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.username}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Usuário desde */}
        <View style={styles.userSinceContainer}>
          <Text style={styles.userSince}>
            Você é usuário desde: {userData.since}
          </Text>
        </View>

        {/* Botões Config e Contato */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/Configuration")}
            accessibilityRole="button"
            accessibilityLabel="Ir para Configurações"
          >
            <Octicons name="gear" size={20} color="black" />
            <Text style={styles.boxText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => Linking.openURL("https://wa.me/5518988179199")}
            accessibilityRole="link"
            accessibilityLabel="Contato via WhatsApp"
          >
            <Entypo name="phone" size={20} color="black" />
            <Text style={styles.boxText}>Contato</Text>
          </TouchableOpacity>
        </View>

        {/* Link para Sobre o APP */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => router.push("/AboutApp")}
          accessibilityRole="button"
          accessibilityLabel="Informações sobre o aplicativo"
        >
          <View style={styles.textContainer}>
            <Text style={styles.dropdownText}>Veja sobre o APP</Text>
          </View>
          <EvilIcons name="chevron-down" size={20} color="black" />
        </TouchableOpacity>

        {/* Seção viagens, diretrizes, avaliações e infos */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/LastActivities")}
            accessibilityRole="button"
            accessibilityLabel="Ver viagens realizadas"
          >
            <Image
              source={require("@images/motorcycle.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Viagens</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/Guidelines")}
            accessibilityRole="button"
            accessibilityLabel="Ver diretrizes do aplicativo"
          >
            <Image
              source={require("@images/list.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Diretrizes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/MyReviews")}
            accessibilityRole="button"
            accessibilityLabel="Ver suas avaliações"
          >
            <Image
              source={require("@images/avaliacao_icon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Avaliações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/UpdateInfo")}
            accessibilityRole="button"
            accessibilityLabel="Atualizar informações"
          >
            <Image
              source={require("@images/updateicon.png")}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>Informações</Text>
          </TouchableOpacity>
        </View>

        {/* Botão logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Encerrar sessão"
        >
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>

      <Tab />

      {/* Modal Logout */}
      <Modal
        animationType="fade"
        transparent
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Logout</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja sair? Nos vemos em breve!
            </Text>

            <View style={styles.modalButtonsContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancelar logout"
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
                disabled={isLoggingOut}
                accessibilityRole="button"
                accessibilityLabel="Confirmar logout"
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Sair</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Foto */}
      <Modal
        animationType="slide"
        transparent
        visible={showPhotoModal}
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.photoModalContainer}>
            <View style={styles.row}>
              <Text style={styles.modalTitle}>Foto de Perfil</Text>
              <Ionicons
                name="close"
                size={20}
                color="#000"
                onPress={() => setShowPhotoModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar modal de foto"
              />
            </View>

            <Pressable
              style={styles.photoModalOption}
              onPress={handleChoosePhoto}
              accessibilityRole="button"
              accessibilityLabel="Escolher foto da galeria"
            >
              <Ionicons name="image" size={24} color="#000" />
              <Text style={styles.photoModalOptionText}>Escolher da Galeria</Text>
            </Pressable>

            {userPhoto && (
              <Pressable
                style={styles.photoModalOption}
                onPress={handleRemovePhoto}
                accessibilityRole="button"
                accessibilityLabel="Remover foto atual"
              >
                <Ionicons name="trash" size={24} color="#000" />
                <Text style={styles.photoModalOptionText}>Remover Foto</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
