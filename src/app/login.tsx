import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import useRighteousFont from "./hooks/Font/Righteous";
import LottieView from "lottie-react-native";
const API_BASE_URL = "https://backend-turma-a-2025.onrender.com";

export default function Login() {
  const [usu_email, setEmail] = useState("");
  const [usu_senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fontLoaded = useRighteousFont();
  // const animationRef = useRef(null);
  const [passwordVisibility, setPasswordVisibility] = useState(true);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };
  if (!fontLoaded) return null;

  const handleLogin = async () => {
    if (!usu_email.trim() || !usu_senha.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        usu_email,
        usu_senha,
      });

      const data = response.data;

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        console.log("Token armazenado com sucesso:", data.token);
      }

      if (data.usuario) {
        await AsyncStorage.setItem("id", data.usuario.id.toString());
        await AsyncStorage.setItem("nome", data.usuario.nome);
        await AsyncStorage.setItem("email", data.usuario.email);
        await AsyncStorage.setItem("telefone", data.usuario.telefone);
        await AsyncStorage.setItem(
          "criado_em",
          data.usuario.criado_em.toString()
        );
      }

      router.replace("/(authenticated)/Home");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", error.response?.data?.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
      <StatusBar backgroundColor="#000" barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.logo}>
              <Image
                source={require("@images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              {/* <LottieView ref={animation Ref} source={require("../assets/splash.json")} autoPlay loop style={styles.logoImage} /> */}
            </View>

            <Text style={styles.title}>Faça login:</Text>
            <Text style={styles.subtitle}>Peça corridas ainda hoje!</Text>

            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color="#fff" />
              <TextInput
                placeholder="E-mail"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={usu_email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              <TextInput
                placeholder="Senha"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={usu_senha}
                onChangeText={setSenha}
                secureTextEntry={passwordVisibility}
              />
              <Ionicons
                name={passwordVisibility ? "eye" : "eye-off-outline"}
                size={24}
                color="#fff"
                onPress={togglePasswordVisibility}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text style={styles.linkText}>
                Ainda não tem uma conta? Cadastre-se!
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 60,
  },
  logo: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 400,
    height: 400,
    marginBottom: -120,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Righteous",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontFamily: "Righteous",
    marginLeft: 10,
    minHeight: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
    minHeight: 50,
  },
  buttonText: {
    color: "#000",
    fontFamily: "Righteous",
    fontSize: 16,
    textAlign: "center",
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    textDecorationLine: "underline",
    fontFamily: "Righteous",
    marginTop: 10,
  },
});
