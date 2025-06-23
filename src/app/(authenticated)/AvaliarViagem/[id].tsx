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
import styles from './styles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import Header from "@components/Header";
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
              <LottieView ref={animationRef} source={reviewsAnimation} autoPlay loop style={{ width: 300, height: 200 }} />
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
