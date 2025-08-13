import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import useRighteousFont from "@hooks/useFont/Righteous";
import { useAuth } from "@contexts/useAuth";
import ToastMessage from "@components/ToastMessage";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://backend-turma-a-2025.onrender.com";

export default function Login() {
  const { login, user, token } = useAuth();
  const [showToastError, setShowToastError] = useState(false);
  const [showToastErrorLogin, setShowToastErrorLogin] = useState(false);
  const [usu_email, setEmail] = useState("");
  const [usu_senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fontLoaded = useRighteousFont();
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  if (!fontLoaded) return null;

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };

  const getPushToken = async (loggedUser: any, authToken: string) => {
    try {
      const savedToken = await AsyncStorage.getItem("pushToken");

      if (savedToken) {
        return savedToken;
      }

      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();

      if (!expoPushToken) {
        console.warn("Não foi possível obter o Expo Push Token.");
        return null;
      }

      await AsyncStorage.setItem("pushToken", expoPushToken);
      console.log("Push token salvo no AsyncStorage:", expoPushToken);

      if (!loggedUser?.id || !authToken) {
        console.warn("Usuário não autenticado, não enviando token para backend.");
        return expoPushToken;
      }

      const url = `${API_BASE_URL}/api/usuarios/${loggedUser.id}/push-token`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ pushToken: expoPushToken }),
      });

      if (!response.ok) {
        console.error("Erro ao enviar push token para backend:", response.status);
      } else {
        console.log("Push token enviado para backend com sucesso");
      }

      return expoPushToken;
    } catch (error) {
      console.error("Erro ao obter/enviar push token:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!usu_email.trim() || !usu_senha.trim()) {
      setShowToastErrorLogin(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        usu_email,
        usu_senha,
      });

      const data = response.data;

      if (!data.token || !data.usuario) {
        setShowToastError(true);
        setLoading(false);
        return;
      }

      await login(data.usuario, data.token);

      const granted = await requestNotificationPermission();
      if (granted) {
        await getPushToken(data.usuario, data.token);
      } else {
        console.log("Permissão de notificação negada");
      }

      router.replace("/(authenticated)/Home");
    } catch (error: any) {
      setShowToastError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={require("@images/background_2.png")}
          style={styles.container}
        >
          <View style={styles.logo}>
            <Image
              source={require("@images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Faça login:</Text>
          <Text style={styles.subtitle}>Peça corridas ainda hoje!</Text>

          <View
            style={[
              styles.inputWrapper,
              focusedField === "email" && styles.inputWrapperFocused,
            ]}
          >
            <Feather
              name="mail"
              size={20}
              color={focusedField === "email" ? "#FFD700" : "#fff"}
            />
            <TextInput
              ref={emailInputRef}
              placeholder="E-mail"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={usu_email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
            />
          </View>

          <View
            style={[
              styles.inputWrapper,
              focusedField === "password" && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedField === "password" ? "#FFD700" : "#fff"}
            />
            <TextInput
              ref={passwordInputRef}
              placeholder="Senha"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={usu_senha}
              onChangeText={setSenha}
              secureTextEntry={passwordVisibility}
              onFocus={() => handleFocus("password")}
              onBlur={handleBlur}
            />
            <Ionicons
              name={passwordVisibility ? "eye" : "eye-off-outline"}
              size={24}
              color={focusedField === "password" ? "#FFD700" : "#fff"}
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

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}>
              Ainda não tem uma conta? Cadastre-se!
            </Text>
          </TouchableOpacity>
        </ImageBackground>
      </ScrollView>

      {showToastError && (
        <ToastMessage
          message="E-mail ou senha incorretos."
          status="ERROR"
          onHide={() => setShowToastError(false)}
        />
      )}
      {showToastErrorLogin && (
        <ToastMessage
          message="Por favor, preencha todos os campos."
          status="ERROR"
          onHide={() => setShowToastErrorLogin(false)}
        />
      )}
    </KeyboardAvoidingView>
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
  inputWrapperFocused: {
    borderColor: "#FFD700",
    backgroundColor: "#222",
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
