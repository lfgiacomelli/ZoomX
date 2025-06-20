import { View, Text, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity, Image, ScrollView, Linking, Modal, Pressable } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@components/header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font";

import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {Entypo, MaterialCommunityIcons, Octicons, EvilIcons, Ionicons} from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();

  const fontLoaded = useRighteousFont();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadUserPhoto();
  }, []);

  const loadUserPhoto = async () => {
    try {
      const photoUri = await AsyncStorage.getItem("userPhoto");
      if (photoUri) {
        setUserPhoto(photoUri);
      }
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  };

  const handleChoosePhoto = async () => {
    setShowPhotoModal(false);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      if (!result.canceled) {
        await AsyncStorage.setItem("userPhoto", result.assets[0].uri);
        setUserPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
    }
  };

  const handleRemovePhoto = async () => {
    setShowPhotoModal(false);
    try {
      await AsyncStorage.removeItem("userPhoto");
      setUserPhoto(null);
    } catch (error) {
      console.error("Erro ao remover foto:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("id");
      await AsyncStorage.removeItem("nome");
      await AsyncStorage.removeItem("email");
      await AsyncStorage.removeItem("telefone");
      await AsyncStorage.removeItem("criado_em");
      await AsyncStorage.removeItem("startAddress");
      console.log("Usuário deslogado com sucesso");
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [userData, setUserData] = useState({
    username: "Usuário",
    email: "",
    since: "Desconhecido",
    telefone: "Desconhecido",
  });

  const fetchUsuario = async () => {
    try {
      const userId = await AsyncStorage.getItem("id");
      if (!userId) {
        console.error("ID do usuário não encontrado");
        return;
      }
      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/usuarios/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do usuário");
      }
      const data = await response.json();
      setUserData({
        username: data.usu_nome || "Usuário",
        email: data.usu_email || "",
        since: data.usu_created_at
          ? new Date(data.usu_created_at).toLocaleDateString()
          : "Desconhecido",
        telefone: data.usu_telefone || "Desconhecido",
      });
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  if (!fontLoaded) {
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
            onPress={() => setShowPhotoModal(true)}
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
            onPress={() => Linking.openURL("https://wa.me/5518988179199")}
          >
            <Entypo name="phone" size={20} color="black" />
            <Text style={styles.boxText}>Contato</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => router.push("/AboutApp")}
        >
          <View style={styles.textContainer}>
            <Text style={styles.dropdownText}>Veja sobre o APP</Text>
          </View>
          <EvilIcons name="chevron-down" size={20} color="black" />
        </TouchableOpacity>


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
            <Image
              source={require("@images/list.png")}
              style={styles.icon}
            />
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
          onPress={() => setShowLogoutModal(true)}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
      <Tab />

      <Modal
        animationType="fade"
        transparent={true}
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
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
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
              />
            </View>

            <Pressable
              style={styles.photoModalOption}
              onPress={handleChoosePhoto}
            >
              <Ionicons name="image" size={24} color="#000" />
              <Text style={styles.photoModalOptionText}>
                Escolher da Galeria
              </Text>
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
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 30,
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  photoContainer: {
    position: "relative",
    marginRight: 16,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: "Righteous",
    fontSize: 24,
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#555",
  },
  userSinceContainer: {
    marginBottom: 12,
    marginTop: 4,
    alignItems: "flex-start",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    alignSelf: "center",
  },
  userSince: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
    textAlign: "left",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
  },
  boxButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    elevation: 2,
  },
  boxText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    width: "100%",
    elevation: 2,
  },

  textContainer: {
    flex: 1,
    alignItems: "center",
  },

  dropdownText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },

  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  iconText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  logoutButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#DB2E05",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontFamily: "Righteous",
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  photoModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  photoModalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  photoModalOptionText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginLeft: 16,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#DB2E05",
  },
  cancelButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
  },
  confirmButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
});
