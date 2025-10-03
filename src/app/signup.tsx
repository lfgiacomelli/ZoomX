import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import useRighteousFont from "@hooks/useFont/Righteous";
import { useAuth } from "@contexts/useAuth";
import ToastMessage from "@components/ToastMessage";
import LottieView from "lottie-react-native";
import MessagesLogin from "@components/MessagesLogin";

import dots from '@animations/dots_animation.json';

export default function SignUp() {
  const fontLoaded = useRighteousFont();
  const router = useRouter();
  const { login } = useAuth();

  const [showToastAllFields, setShowToastAllFields] = useState(false);
  const [showToastError, setShowToastError] = useState(false);
  const [showToastErrorEmail, setShowToastErrorEmail] = useState(false);
  const [showToastErrorPassword, setShowToastErrorPassword] = useState(false);
  const [showToastServerError, setShowToastServerError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const inputRefs = {
    usu_nome: useRef<TextInput>(null),
    usu_email: useRef<TextInput>(null),
    usu_telefone: useRef<TextInput>(null),
    usu_cpf: useRef<TextInput>(null),
    usu_senha: useRef<TextInput>(null),
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const [form, setForm] = useState({
    usu_nome: "",
    usu_email: "",
    usu_telefone: "",
    usu_cpf: "",
    usu_senha: "",
  });

  if (!fontLoaded) return null;

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const formatarTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, "");
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async () => {
    if (!form.usu_nome || !form.usu_email || !form.usu_telefone || !form.usu_senha) {
      setShowToastAllFields(true);
      return;
    }

    if (!validateEmail(form.usu_email)) {
      setShowToastErrorEmail(true);
      return;
    }

    if (form.usu_senha.length < 6) {
      setShowToastErrorPassword(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://backend-turma-a-2025.onrender.com/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usu_nome: form.usu_nome,
          usu_telefone: form.usu_telefone.replace(/\D/g, ""),
          usu_ativo: true,
          usu_email: form.usu_email,
          usu_senha: form.usu_senha,
          usu_cpf: form.usu_cpf.replace(/\D/g, ""),
          usu_created_at: new Date().toISOString(),
          usu_updated_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setShowToastError(true);
        return;
      }

      if (data.token && data.usuario) {
        login(data.usuario, data.token);
        router.replace('/Home')
      }

    } catch (error: any) {
      console.error("Erro completo:", error);
      setShowToastServerError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <StatusBar backgroundColor={"#000"} barStyle="light-content" />
        {isLoading ? (
          <ImageBackground
            source={require("@images/background.png")}
            style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
          >
            <LottieView source={dots} autoPlay loop style={{ width: 200, height: 200 }} />
            <MessagesLogin loading={isLoading} />
          </ImageBackground>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContainer, { flexGrow: 1, justifyContent: "center" }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground source={require("@images/background.png")} style={styles.container}>
              <View style={styles.logo}>
                <Image source={require("@images/logo.png")} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Crie sua conta:</Text>
              <Text style={styles.subtitle}>Peça corridas ainda hoje!</Text>

              <View style={[
                styles.inputWrapper,
                focusedField === 'usu_nome' && styles.inputWrapperFocused
              ]}>
                <FontAwesome name="user" size={20} color={focusedField === 'usu_nome' ? "#FFD700" : "#fff"} />
                <TextInput
                  ref={inputRefs.usu_nome}
                  placeholder="Insira seu Nome Completo"
                  placeholderTextColor="#aaa"
                  onChangeText={(text) => handleChange("usu_nome", text)}
                  style={styles.input}
                  value={form.usu_nome}
                  onFocus={() => handleFocus('usu_nome')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                focusedField === 'usu_email' && styles.inputWrapperFocused
              ]}>
                <Feather name="mail" size={20} color={focusedField === 'usu_email' ? "#FFD700" : "#fff"} />
                <TextInput
                  ref={inputRefs.usu_email}
                  placeholder="Insira seu E-mail"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => handleChange("usu_email", text)}
                  style={styles.input}
                  value={form.usu_email}
                  onFocus={() => handleFocus('usu_email')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                focusedField === 'usu_telefone' && styles.inputWrapperFocused
              ]}>
                <Feather name="phone" size={20} color={focusedField === 'usu_telefone' ? "#FFD700" : "#fff"} />
                <TextInput
                  ref={inputRefs.usu_telefone}
                  placeholder="Insira seu Telefone"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  value={form.usu_telefone}
                  onChangeText={(text) => handleChange("usu_telefone", formatarTelefone(text))}
                  style={styles.input}
                  onFocus={() => handleFocus('usu_telefone')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                focusedField === 'usu_cpf' && styles.inputWrapperFocused
              ]}>
                <Feather name="file-text" size={20} color={focusedField === 'usu_cpf' ? "#FFD700" : "#fff"} />
                <TextInput
                  ref={inputRefs.usu_cpf}
                  placeholder="Insira seu CPF (apenas números)"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  maxLength={11}
                  onChangeText={(text) => handleChange("usu_cpf", text)}
                  style={styles.input}
                  value={form.usu_cpf}
                  onFocus={() => handleFocus('usu_cpf')}
                  onBlur={handleBlur}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                focusedField === 'usu_senha' && styles.inputWrapperFocused
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedField === 'usu_senha' ? "#FFD700" : "#fff"}
                />
                <TextInput
                  ref={inputRefs.usu_senha}
                  placeholder="Insira sua Senha (mínimo 6 caracteres)"
                  placeholderTextColor="#aaa"
                  secureTextEntry={passwordVisibility}
                  onChangeText={(text) => handleChange("usu_senha", text)}
                  style={styles.input}
                  value={form.usu_senha}
                  onFocus={() => handleFocus('usu_senha')}
                  onBlur={handleBlur}
                />
                <Ionicons
                  name={passwordVisibility ? "eye" : "eye-off-outline"}
                  size={24}
                  color={focusedField === 'usu_senha' ? "#FFD700" : "#fff"}
                  onPress={togglePasswordVisibility}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>Criar Conta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.linkText}>Já possui conta? Faça login!</Text>
              </TouchableOpacity>
            </ImageBackground>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {showToastAllFields && (
        <ToastMessage
          message="Por favor, preencha todos os campos."
          status="ERROR"
          onHide={() => setShowToastAllFields(false)}
        />
      )}

      {showToastError && (
        <ToastMessage
          message="E-mail já cadastrado."
          status="ERROR"
          onHide={() => setShowToastError(false)}
        />
      )}

      {showToastErrorEmail && (
        <ToastMessage
          message="E-mail inválido."
          status="ERROR"
          onHide={() => setShowToastErrorEmail(false)}
        />
      )}

      {showToastErrorPassword && (
        <ToastMessage
          message="A senha deve ter no mínimo 6 caracteres."
          status="ERROR"
          onHide={() => setShowToastErrorPassword(false)}
        />
      )}

      {showToastServerError && (
        <ToastMessage
          message="Não foi possível conectar ao servidor."
          status="ERROR"
          onHide={() => setShowToastServerError(false)}
        />
      )}
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
    marginTop: -90,
    width: 400,
    height: 400,
    marginBottom: -130,
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