import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import useRighteousFont from "./hooks/Font/Righteous";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "react-native";
import LottieView from "lottie-react-native";

export default function SignIn() {
  const fontLoaded = useRighteousFont();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // const animationRef = useRef(null);
  const [passwordVisibility, setPasswordVisibility] = useState(true);

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

  if (!fontLoaded) {
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const formatarTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, "");
    let telefoneFormatado = "";

    if (numeros.length <= 2) {
      telefoneFormatado = `(${numeros}`;
    } else if (numeros.length <= 7) {
      telefoneFormatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      telefoneFormatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      telefoneFormatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
    return telefoneFormatado;
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (
      !form.usu_nome ||
      !form.usu_email ||
      !form.usu_telefone ||
      !form.usu_senha
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    if (!validateEmail(form.usu_email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido");
      return;
    }

    if (form.usu_senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://backend-turma-a-2025.onrender.com/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.message || "Erro ao criar usuário";
        if (data.errors) {
          errorMsg +=
            "\n" + data.errors.map((err: any) => err.message).join("\n");
        }
        Alert.alert("Erro", errorMsg);
        return;
      }

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
      }

      if (data.usuario) {
        await AsyncStorage.setItem("id", data.usuario.id.toString());
        await AsyncStorage.setItem("nome", data.usuario.nome);
        await AsyncStorage.setItem("email", data.usuario.email);
        await AsyncStorage.setItem("telefone", data.usuario.telefone);
        await AsyncStorage.setItem("cpf", data.usuario.cpf);
        await AsyncStorage.setItem(
          "criado_em",
          data.usuario.criado_em.toString()
        );
      }

      setModalVisible(true);

      console.log("Usuário criado com sucesso:", data);

      router.replace("/(authenticated)/Home");
    } catch (error: any) {
      console.error("Erro completo:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível conectar ao servidor."
      );
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
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { flexGrow: 1, justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Conta criada com sucesso!</Text>
                <Text style={styles.modalMessage}>
                  Seus dados já foram criptografados!
                </Text>
                <Text style={styles.modalMessage}>
                  Comece a usar o{" "}
                  <Text style={{ fontFamily: "Righteous" }}>ZoomX</Text> agora
                  mesmo!
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    router.replace("/(authenticated)/Home");
                  }}
                >
                  <Text style={styles.modalButtonText}>Começar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.container}>
            <View style={styles.logo}>
              <Image
                source={require("@images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              {/* <LottieView
              source={require("../assets/splash.json")}
              ref={animationRef}
              autoPlay
              loop
              style={styles.logoImage}
            /> */}
            </View>
            <Text style={styles.title}>Crie sua conta:</Text>
            <Text style={styles.subtitle}>Peça corridas ainda hoje!</Text>

            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={20} color="#fff" />
              <TextInput
                placeholder="Insira seu Nome Completo"
                placeholderTextColor="#aaa"
                onChangeText={(text) => handleChange("usu_nome", text)}
                style={styles.input}
                value={form.usu_nome}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color="#fff" />
              <TextInput
                placeholder="Insira seu E-mail"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => handleChange("usu_email", text)}
                style={styles.input}
                value={form.usu_email}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="phone" size={20} color="#fff" />
              <TextInput
                placeholder="Insira seu Telefone"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                value={form.usu_telefone}
                onChangeText={(text) =>
                  handleChange("usu_telefone", formatarTelefone(text))
                }
                style={styles.input}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="file-text" size={20} color="#fff" />
              <TextInput
                placeholder="Insira seu CPF (apenas números)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                maxLength={11}
                onChangeText={(text) => handleChange("usu_cpf", text)}
                style={styles.input}
                value={form.usu_cpf}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              <TextInput
                placeholder="Insira sua Senha (mínimo 6 caracteres)"
                placeholderTextColor="#aaa"
                secureTextEntry={passwordVisibility}
                onChangeText={(text) => handleChange("usu_senha", text)}
                style={styles.input}
                value={form.usu_senha}
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
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.linkText}>Já possui conta? Faça login!</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Righteous",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    fontFamily: "Righteous",
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",
  },
});
