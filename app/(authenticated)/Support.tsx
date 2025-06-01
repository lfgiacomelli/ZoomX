import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Dimensions, SafeAreaView, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import Header from '../Components/header';
import Tab from '../Components/Tab';

const { width } = Dimensions.get('window');
const whatsappNumber = '5511999999999';

export default function Support() {
  const handleSupportPress = async () => {
    try {
      const url = `whatsapp://send?phone=${whatsappNumber}&text=Olá, gostaria de suporte sobre o aplicativo.`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp não instalado',
          'Parece que você não tem o WhatsApp instalado. Deseja instalar agora?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Instalar',
              onPress: () => Linking.openURL('https://whatsapp.com/download')
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp no momento.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        
        <View style={styles.content}>
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../assets/support_animation.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Precisa de ajuda?</Text>
            
            <Text style={styles.message}>
              Nosso app ainda não possui um chat de atendimento, mas você pode 
              conversar diretamente com nossa equipe pelo WhatsApp. Respondemos 
              rapidamente para resolver qualquer dúvida ou problema que você tiver.
            </Text>
          </View>

          <TouchableOpacity 
            onPress={handleSupportPress} 
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Conversar no WhatsApp</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Horário de atendimento: Seg-Sex, 9h às 18h
          </Text>
          <Text style={styles.footerText}>
            Atte. Equipe ZoomX
            </Text>
        </View>
        
        <Tab />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  lottie: {
    width: width * 0.7,
    height: width * 0.7,
  },
  textContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Righteous',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Righteous',
    color: '#333333',
    textAlign: 'justify',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Righteous',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Righteous',
    color: '#666666',
    marginTop: 24,
    textAlign: 'center',
  },
});