// SignIn.tsx
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
  Modal,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import useRighteousFont from "./hooks/Font/Righteous";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignIn() {
  const fontLoaded = useRighteousFont();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTermosVisible, setModalTermosVisible] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const togglePasswordVisibility = () => setPasswordVisibility(!passwordVisibility);

  const [form, setForm] = useState({
    usu_nome: "",
    usu_email: "",
    usu_telefone: "",
    usu_cpf: "",
    usu_senha: "",
  });

  if (!fontLoaded) return null;

  const handleChange = (field: any, value: any) => setForm({ ...form, [field]: value });

  const formatarTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, "");
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!aceitaTermos) {
      Alert.alert("Atenção", "Você deve aceitar os termos de uso para continuar.");
      return;
    }
    if (!form.usu_nome || !form.usu_email || !form.usu_telefone || !form.usu_senha) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }
    if (!validateEmail(form.usu_email)) {
      Alert.alert("Erro", "E-mail inválido");
      return;
    }
    if (form.usu_senha.length < 6) {
      Alert.alert("Erro", "Senha mínima de 6 caracteres");
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
        Alert.alert("Erro", data.message || "Erro ao criar usuário");
        return;
      }
      if (data.token) await AsyncStorage.setItem("token", data.token);
      if (data.usuario) {
        await AsyncStorage.setItem("id", data.usuario.id.toString());
        await AsyncStorage.setItem("nome", data.usuario.nome);
        await AsyncStorage.setItem("email", data.usuario.email);
        await AsyncStorage.setItem("telefone", data.usuario.telefone);
        await AsyncStorage.setItem("cpf", data.usuario.cpf);
        await AsyncStorage.setItem("criado_em", data.usuario.criado_em.toString());
      }
      setModalVisible(true);
      router.replace("/(authenticated)/Home");
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : undefined;
      Alert.alert("Erro", errorMessage || "Erro ao conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Conta criada com sucesso!</Text>
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

      <Modal visible={modalTermosVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Termos de Uso e Privacidade</Text>
            <ScrollView>
              <Text style={styles.modalMessage}>
                Ao criar uma conta no ZoomX, você concorda com o tratamento de seus dados pessoais
                conforme a LGPD. Seus dados serão utilizados apenas para cadastro, segurança e melhorias.
                Nenhuma informação será compartilhada com terceiros sem seu consentimento.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setModalTermosVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.title}>Crie sua conta:</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Nome Completo"
              placeholderTextColor="#aaa"
              onChangeText={(text) => handleChange("usu_nome", text)}
              style={styles.input}
              value={form.usu_nome}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => handleChange("usu_email", text)}
              style={styles.input}
              value={form.usu_email}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Telefone"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              value={form.usu_telefone}
              onChangeText={(text) => handleChange("usu_telefone", formatarTelefone(text))}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="CPF"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={11}
              onChangeText={(text) => handleChange("usu_cpf", text)}
              style={styles.input}
              value={form.usu_cpf}
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Senha (mínimo 6 caracteres)"
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

          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 12 }}>
            <TouchableOpacity
              onPress={() => setAceitaTermos(!aceitaTermos)}
              style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderColor: "#fff",
                backgroundColor: aceitaTermos ? "#fff" : "transparent",
                marginRight: 8,
                borderRadius: 4,
              }}
            />
            <Text style={{ color: "#fff", fontFamily: "Righteous" }}>
              Li e aceito os{' '}
              <Text onPress={() => setModalTermosVisible(true)} style={{ textDecorationLine: "underline" }}>
                termos de uso
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, !aceitaTermos && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={!aceitaTermos || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontFamily: "Righteous", color: "#fff", textAlign: "center", marginBottom: 20 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#111", padding: 12, borderRadius: 8, marginBottom: 15 },
  input: { flex: 1, color: "#fff", fontFamily: "Righteous", marginLeft: 10 },
  button: { backgroundColor: "#fff", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 15 },
  buttonText: { color: "#000", fontFamily: "Righteous", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#fff", padding: 24, borderRadius: 12, width: "85%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, fontFamily: "Righteous", textAlign: "center" },
  modalMessage: { fontSize: 16, color: "#333", marginBottom: 20, fontFamily: "Righteous", textAlign: "center" },
  modalButton: { backgroundColor: "#000", padding: 12, borderRadius: 8 },
  modalButtonText: { color: "#fff", fontFamily: "Righteous" },
});
