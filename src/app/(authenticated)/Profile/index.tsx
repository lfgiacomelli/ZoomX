import React, { useEffect, useRef, useState, useMemo } from "react";
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
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  Entypo,
  MaterialCommunityIcons,
  Octicons,
  Ionicons,
} from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import Header from "@components/Header";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const photoSheetRef = useRef<BottomSheet>(null);
  const openPhotoSheet = () => photoSheetRef.current?.expand();
  const closePhotoSheet = () => photoSheetRef.current?.close();

  const snapPoints = useMemo(() => ["15%", "30%"], []);

  useEffect(() => {
    loadUserPhoto();
    loadUserDataFromStorageAndUpdate();
  }, []);

  const openLogoutSheet = () => bottomSheetRef.current?.expand();
  const closeLogoutSheet = () => bottomSheetRef.current?.close();

  async function loadUserPhoto() {
    try {
      const photoUri = await AsyncStorage.getItem("userPhoto");
      if (photoUri) setUserPhoto(photoUri);
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  }

  async function loadUserDataFromStorageAndUpdate() {
    try {
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

      await fetchUsuarioAndUpdateStorage();
    } catch (error) {
      console.error("Erro ao carregar dados do AsyncStorage:", error);
      setLoadingUserData(false);
    }
  }

  async function fetchUsuarioAndUpdateStorage() {
    try {
      const userId = await AsyncStorage.getItem("id");
      const token = await AsyncStorage.getItem("token");

      if (!userId || !token) {
        setLoadingUserData(false);
        return;
      }

      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/usuarios/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");

      const data = await response.json();

      const sinceFormatted = data.usu_created_at
        ? new Date(data.usu_created_at).toLocaleDateString()
        : "Desconhecido";

      setUserData({
        username: data.usu_nome || "Usuário",
        email: data.usu_email || "",
        telefone: data.usu_telefone || "Desconhecido",
        since: sinceFormatted,
      });

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
      await AsyncStorage.multiRemove([
        "token",
        "id",
        "nome",
        "email",
        "telefone",
        "criado_em",
        "cpf",
        "startAddress",
        "userPhoto",
      ]);
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
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={openPhotoSheet}
            style={styles.photoContainer}
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
        <View style={styles.userSinceContainer}>
          <Text style={styles.userSince}>
            Você é usuário desde: {userData.since}
          </Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/Configuration")}
          >
            <Octicons name="gear" size={20} color="black" />
            <Text style={styles.boxText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => Linking.openURL("https://wa.me/")}
          >
            <Entypo name="phone" size={20} color="black" />
            <Text style={styles.boxText}>Contato</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/LastActivities")}
          >
            <Image
              source={require("@images/motorcycle.png")}
              style={styles.icon}
            />
            <Text style={styles.iconText}>Viagens</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/Guidelines")}
          >
            <Image source={require("@images/list.png")} style={styles.icon} />
            <Text style={styles.iconText}>Diretrizes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/MyReviews")}
          >
            <Image
              source={require("@images/avaliacao_icon.png")}
              style={styles.icon}
            />
            <Text style={styles.iconText}>Avaliações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.boxButton}
            onPress={() => router.push("/UpdateInfo")}
          >
            <Image
              source={require("@images/updateicon.png")}
              style={styles.icon}
            />
            <Text style={styles.iconText}>Informações</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={openLogoutSheet}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>


      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        detached={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}

      >
        <BottomSheetView style={styles.sheetContainer}>
          <Text style={styles.modalTitle}>Confirmar Logout</Text>
          <Text style={styles.modalMessage}>
            Tem certeza que deseja sair? Nos vemos em breve!
          </Text>

          <View style={styles.modalButtonsContainer}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={closeLogoutSheet}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Sair</Text>
              )}
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={photoSheetRef}
        index={-1}
        snapPoints={["30%"]}
        enablePanDownToClose
        detached={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContainer}>
          <View style={styles.row}>
            <Text style={styles.modalTitle}>Foto de Perfil</Text>
            <Ionicons
              name="close"
              size={20}
              color="#000"
              onPress={closePhotoSheet}
            />
          </View>

          <Pressable
            style={styles.photoModalOption}
            onPress={() => {
              handleChoosePhoto();
              closePhotoSheet();
            }}
          >
            <Ionicons name="image" size={24} color="#000" />
            <Text style={styles.photoModalOptionText}>Escolher da Galeria</Text>
          </Pressable>

          {userPhoto && (
            <Pressable
              style={styles.photoModalOption}
              onPress={() => {
                handleRemovePhoto();
                closePhotoSheet();
              }}
            >
              <Ionicons name="trash" size={24} color="#000" />
              <Text style={styles.photoModalOptionText}>Remover Foto</Text>
            </Pressable>
          )}
        </BottomSheetView>
      </BottomSheet>

    </>
  );
}
