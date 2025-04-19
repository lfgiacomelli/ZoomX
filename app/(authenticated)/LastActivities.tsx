import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useEffect, useState } from 'react';
import Tab from '../Components/Tab';
import useRighteousFont from '../../hooks/Font/index';
import Header from '../Components/header';

export default function Travels() {
  const fontLoaded = useRighteousFont();

  interface Atividade {
    via_servico: string;
    via_data: string | null;
    via_origem?: string;
    via_destino?: string;
    via_valor?: number;
  }

  const [data, setData] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const baseURL = 'https://super-duper-space-enigma-6j7g7jj46p92x44q-3000.app.github.dev';
  const URL = '/api/viagens';

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const fetchData = async () => {
    const route = `${baseURL}${URL}`;
    try {
      const response = await fetch(route);
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };

  if (!fontLoaded) return null;

  return (
    <>
      <Header />
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Últimas atividades</Text>

          {loading && !error ? (
            <ActivityIndicator size="large" color="#000" />
          ) : error ? (
            <Text style={styles.error}>Erro: {error}</Text>
          ) : data.length === 0 ? (
            <Text style={styles.empty}>Nenhuma atividade encontrada.</Text>
          ) : (
            data.map((atividade, index) => {
              const isExpanded = expandedIndex === index;
              const icone = atividade.via_servico === 'Moto Táxi'
                ? require('../../assets/motorcycle.png')
                : require('../../assets/box.png');

              const dataFormatada = atividade.via_data
                ? new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  }).format(new Date(atividade.via_data))
                : '--/--';

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, isExpanded && styles.cardExpanded]}
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.9}
                >
                  <Image source={icone} style={styles.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Serviço:</Text>
                    <Text style={styles.text}>{atividade.via_servico || 'Indefinido'}</Text>
                    {isExpanded && (
                      <>
                        <Text style={styles.detail}>Origem: {atividade.via_origem || 'N/A'}</Text>
                        <Text style={styles.detail}>Destino: {atividade.via_destino || 'N/A'}</Text>
                        <Text style={styles.detail}>Valor: R$ {atividade.via_valor?.toFixed(2) || '0,00'}</Text>
                      </>
                    )}
                  </View>
                  <View style={styles.dateContainer}>
                    <Text style={styles.label}>Data:</Text>
                    <Text style={styles.text}>{dataFormatada}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
        <Tab />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Righteous',
    marginBottom: 16,
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 21,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: 355,
    minHeight: 70,
  },
  cardExpanded: {
    paddingBottom: 20,
  },
  icon: {
    width: 69,
    height: 69,
    resizeMode: 'contain',
    marginRight: 16,
  },
  label: {
    fontFamily: 'Righteous',
    fontSize: 14,
    color: '#aaa',
  },
  text: {
    fontFamily: 'Righteous',
    fontSize: 24,
    color: '#fff',
    marginTop: -2,
  },
  detail: {
    fontFamily: 'Righteous',
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  dateContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Righteous',
  },
  empty: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Righteous',
  },
});
