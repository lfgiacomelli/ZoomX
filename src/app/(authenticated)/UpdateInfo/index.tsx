import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView, TouchableWithoutFeedback } from "react-native";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "@contexts/useAuth";

import styles from "./styles";

import LottieView from "lottie-react-native";

import Header from "@components/Header";
import useRighteousFont from "@hooks/useFont/Righteous";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import infoAnimation from "@animations/info_animation.json";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const fontLoaded = useRighteousFont();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCPF] = useState("");
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
        setCPF(data.usu_cpf || "");
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
            usu_cpf: cpf,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar informações");
      }

      setModalVisible(true);

      if (user) {
        await updateUser({
          nome: name,
          email: email,
          telefone: phone,
          cpf: cpf,
        });
        console.log("Dados do usuário atualizados no AsyncStorage e contexto");
      }

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
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Tem algo de errado?{"\n"}Corrija aqui!</Text>

        <Text style={styles.label}>Nome completo:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="..."
            value={name}
            onChangeText={setName}
          />
          <Ionicons name="person" size={22} color="black" />
        </View>

        <Text style={styles.label}>E-mail:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="..."
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
            placeholder="..."
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
        <Text style={styles.label}>CPF:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="..."
            keyboardType="number-pad"
            value={cpf}
            onChangeText={setCPF}
          />
          <Ionicons name="mail" size={22} color="black" />
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
      </ScrollView>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalContainer}>
                <LottieView
                  source={infoAnimation}
                  autoPlay
                  loop={false}
                  ref={animationRef}
                  style={{ width: 100, height: 100, alignSelf: "center" }}
                />
                <Text style={styles.modalText}>
                  Informações atualizadas com sucesso!
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.push("/Profile");
                  }}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
