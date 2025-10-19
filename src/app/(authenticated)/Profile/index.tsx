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
  Pressable,
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

import { Modalize } from 'react-native-modalize';

import Header from "@components/Header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/useFont/Righteous";

import styles from "./styles";

import defaultUserPhoto from "@images/userPhotoDefault.png";
import { useAuth } from "@contexts/useAuth";

export default function Profile() {
  const router = useRouter();
  const fontLoaded = useRighteousFont();

  const { user, logout, loading } = useAuth();

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const photoSheetRef = useRef<Modalize>(null);
  const modalizeRef = useRef<Modalize>(null);


  useEffect(() => {
    loadUserPhoto();
  }, []);

  const openPhotoSheet = () => photoSheetRef.current?.open();
  const closePhotoSheet = () => photoSheetRef.current?.close();

  const openLogoutSheet = () => modalizeRef.current?.open();
  const closeLogoutSheet = () => modalizeRef.current?.close();

  async function loadUserPhoto() {
    try {
      const photoUri = await AsyncStorage.getItem("userPhoto");
      if (photoUri) setUserPhoto(photoUri);
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  }

  async function handleChoosePhoto() {
    closePhotoSheet();
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
    closePhotoSheet();
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
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      setIsLoggingOut(false);
    }
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
            <Image source={userPhoto ? { uri: userPhoto } : defaultUserPhoto}
              style={styles.profilePhoto}
            />
            <View style={styles.editPhotoButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nome || "Usuário"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>
        </View>
        <View style={styles.col}>
          <Pressable onPress={() => router.push("/UpdateInfo")} style={styles.pressable}>
            <Ionicons name="pencil-sharp" size={24} color="#007BFF" />
            <Text style={styles.pressableTitle}>Editar suas informações</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/Guidelines")} style={styles.pressable}>
            <Ionicons name="document" size={24} color="#28A745" />
            <Text style={styles.pressableTitle}>Diretrizes</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/Configuration")} style={styles.pressable}>
            <Ionicons name="settings" size={24} color="#6C757D" />
            <Text style={styles.pressableTitle}>Configurações</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/MyReviews")} style={styles.pressable}>
            <Ionicons name="star" size={24} color="#FFC107" />
            <Text style={styles.pressableTitle}>Minhas avaliações</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/AboutApp")} style={[styles.pressable, styles.lastPressable]}>
            <Ionicons name="apps" size={24} color="#17A2B8" />
            <Text style={styles.pressableTitle}>Veja sobre o aplicativo</Text>
          </Pressable>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={openLogoutSheet}>
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>

      <Tab />

      <Modalize
        ref={modalizeRef}
        modalStyle={{ paddingTop: 30 }}
        modalHeight={300}
        useNativeDriver
        panGestureEnabled
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.modalTitle}>Confirmar Logout</Text>
          <Text style={styles.modalMessage}>
            Tem certeza que deseja sair? Nos vemos em breve!
          </Text>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={closeLogoutSheet}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Sair</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>

      <Modalize
        ref={photoSheetRef}
        modalStyle={{ paddingTop: 30 }}
        modalHeight={300}
        useNativeDriver
        panGestureEnabled
      >

        <View style={styles.sheetContainer}>
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
            onPress={handleChoosePhoto}
          >
            <Ionicons name="image" size={24} color="#000" />
            <Text style={styles.photoModalOptionText}>Escolher da Galeria</Text>
          </Pressable>

          {userPhoto && (
            <Pressable
              style={styles.photoModalOption}
              onPress={handleRemovePhoto}
            >
              <Ionicons name="trash" size={24} color="#000" />
              <Text style={styles.photoModalOptionText}>Remover Foto</Text>
            </Pressable>
          )}
        </View>
      </Modalize>
    </>
  );
}