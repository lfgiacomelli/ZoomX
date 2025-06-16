import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Header from "@components/header";
import Tab from '@components/Tab';

import reviewsAnimation from '@animations/reviews_animation.json';
const StarRating = ({ rating, setRating }: { rating: number; setRating: (value: number) => void }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function AvaliarViagem() {
  const { id: via_codigo } = useLocalSearchParams();
  const router = useRouter();

  const [usu_codigo, setUsuCodigo] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    const fetchUsuCodigo = async () => {
      const codigo = await AsyncStorage.getItem('id');
      setUsuCodigo(codigo);
    };
    fetchUsuCodigo();
  }, []);

  const enviarAvaliacao = async () => {
    if (!usu_codigo) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://backend-turma-a-2025.onrender.com/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usu_codigo,
          via_codigo,
          ava_nota: rating,
          ava_comentario: comentario.trim() || null,
          ava_data_avaliacao: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    setShowModal(false);
    router.replace('/Home');
  };

  if (!usu_codigo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Avaliar Viagem</Text>

        <View style={styles.ratingSection}>
          <Text style={styles.subtitle}>Selecione sua avaliação:</Text>
          <View style={styles.starsWrapper}>
            <StarRating rating={rating} setRating={setRating} />
          </View>
          <Text style={styles.ratingText}>
            {rating ? `Você avaliou com ${rating} estrela${rating > 1 ? 's' : ''}` : 'Toque nas estrelas para avaliar'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.subtitle}>Comentário (opcional):</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={4}
            placeholder="Conte como foi sua experiência..."
            placeholderTextColor="#888"
            value={comentario}
            onChangeText={setComentario}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, rating === 0 && styles.buttonDisabled]}
          onPress={enviarAvaliacao}
          disabled={rating === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#f0f0f0" />
          ) : (
            <Text style={styles.buttonText}>ENVIAR AVALIAÇÃO</Text>
          )}
        </TouchableOpacity>

        <Modal visible={showModal} transparent animationType="fade" onRequestClose={fecharModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LottieView ref={animationRef} source={reviewsAnimation} autoPlay loop style={{ width: 200, height: 200 }} />
              <Text style={styles.modalText}>
                Muito obrigado por avaliar a viagem!{'\n'}Assim conseguimos melhorar nossos serviços.
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={fecharModal}>
                <Text style={styles.modalButtonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <Tab />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontFamily: 'Righteous',
    fontSize: 28,
    color: '#000',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  ratingSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  starsWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    fontSize: 40,
    color: '#FFD700',
    marginHorizontal: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#555',
    letterSpacing: 0.3,
  },
  commentSection: {
    marginBottom: 32,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Righteous',
    color: '#000',
    height: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#f0f0f0',
    fontFamily: 'Righteous',
    fontSize: 18,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'Righteous',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    color: '#f0f0f0',
    fontFamily: 'Righteous',
    fontSize: 16,
  },
});
