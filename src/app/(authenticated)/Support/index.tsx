import { View, Text, TouchableOpacity, Linking, StyleSheet, Dimensions, SafeAreaView, Alert } from "react-native";
import styles from "./styles";

import LottieView from "lottie-react-native";

import Header from "@components/Header";
import Tab from "@components/Tab";

import supportAnimation from "@animations/support_animation.json";

const email_default = "support@zoomx.com.br";

export default function Support() {
  const handleSupportPress = async () => {
    try {
      const url = `mailto:${email_default}?subject=Suporte ZoomX&body=Olá, preciso de ajuda com o seguinte assunto:`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "App de e-mail não disponível",
          "Não foi possível abrir o aplicativo de e-mail. Verifique se você tem um app de e-mail instalado no seu dispositivo.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Erro ao abrir e-mail:", error);
      Alert.alert("Erro", "Não foi possível iniciar o envio do e-mail.");
    }
  };

  return (
    <>
      <Header />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.animationContainer}>
              <LottieView
                source={supportAnimation}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>Precisa de ajuda?</Text>

              <Text style={styles.message}>
                Nosso app ainda não possui um chat de atendimento, mas você pode
                entrar em contato diretamente com nossa equipe por e-mail.
                Respondemos rapidamente para ajudar com qualquer dúvida ou
                problema que você tiver.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSupportPress}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Enviar email</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Horário de atendimento: Seg-Sex, 9h às 18h
            </Text>
            <Text style={styles.footerText}>Atte. Equipe ZoomX</Text>
          </View>
        </View>
      </SafeAreaView>
      <Tab />
    </>
  );
}
