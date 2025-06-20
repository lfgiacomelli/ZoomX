import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LottieView from "lottie-react-native";

import Header from "@components/header";
import Tab from "@components/Tab";
import useRighteousFont from "@hooks/Font";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import infoAnimation from "@animations/info_animation.json";

export default function EditProfile() {
  const fontLoaded = useRighteousFont();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const animationRef = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const id = await AsyncStorage.getItem("id");
        const token = await AsyncStorage.getItem("token");
        if (!id) return;
        setUserId(id);

        const response = await fetch(
          `https://backend-turma-a-2025.onrender.com/api/usuarios/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        setName(data.usu_nome || "");
        setEmail(data.usu_email || "");
        setPhone(data.usu_telefone || "");
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
  }, []);

  if (!fontLoaded) return null;

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!name || !email || !phone || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://backend-turma-a-2025.onrender.com/api/usuarios/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usu_nome: name,
            usu_email: email,
            usu_telefone: phone,
            usu_senha: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar informações");
      }
      setModalVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message || "Erro desconhecido");
      } else {
        Alert.alert("Erro", "Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Tem algo de errado?{"\n"}Corrija aqui!</Text>

        <Text style={styles.label}>Nome completo:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="4ForDevs"
            value={name}
            onChangeText={setName}
          />
          <Ionicons name="person" size={22} color="black" />
        </View>

        <Text style={styles.label}>E-mail:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="4fordevs@email.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Ionicons name="mail" size={22} color="black" />
        </View>

        <Text style={styles.label}>Telefone:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Ionicons name="call" size={22} color="black" />
        </View>

        <Text style={styles.label}>Senha:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!passwordVisible}
            placeholder="********"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={22}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Atualizar Informações</Text>
          )}
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <LottieView
              source={infoAnimation}
              autoPlay
              loop={false}
              ref={animationRef}
              style={{ width: 100, height: 100, alignSelf: "center" }}/>
            <Text style={styles.modalText}>
              Informações atualizadas com sucesso!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Tab />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 22,
    marginBottom: 20,
    color: "#000",
  },
  label: {
    fontFamily: "Righteous",
    fontSize: 16,
    marginBottom: 6,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontFamily: "Righteous",
    fontSize: 15,
    color: "#000",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalText: {
    fontFamily: "Righteous",
    fontSize: 18,
    textAlign: "center",
    color: "#000",
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Righteous",
    fontSize: 16,
  },
});
