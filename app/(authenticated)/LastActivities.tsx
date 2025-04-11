import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Tab from '../Components/Tab';
import useRighteousFont from '../../hooks/Font/index';
import Header from '../Components/header';

const atividades = [
  { id: 1, tipo: 'Entrega', data: '10/08', icon: require('../../assets/box.png') },
  { id: 2, tipo: 'Viagem', data: '15/07', icon: require('../../assets/motorcycle.png') },
  { id: 3, tipo: 'Viagem', data: '04/06', icon: require('../../assets/motorcycle.png') },
  { id: 4, tipo: 'Entrega', data: '09/04', icon: require('../../assets/box.png') },
];

export default function Travels() {
  const fontLoaded = useRighteousFont();
  if (!fontLoaded) return null;

  return (
    <>
      <Header />
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Últimas atividades</Text>

          {atividades.map((atividade) => (
            <View key={atividade.id} style={styles.card}>
              <Image source={atividade.icon} style={styles.icon} />
              <View>
                <Text style={styles.label}>Serviço:</Text>
                <Text style={styles.text}>{atividade.tipo}</Text>
              </View>
              <View style={{ marginLeft: 'auto' }}>
                <Text style={styles.label}>Data:</Text>
                <Text style={styles.text}>{atividade.data}</Text>
              </View>
            </View>
          ))}
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
    paddingTop: 30,
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Righteous',
    marginBottom: 20,
    color: '#000',
  },
  card: {
    width: 355,
    height: 70,
    backgroundColor: '#000',
    borderRadius: 21,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  label: {
    fontFamily: 'Righteous',
    fontSize: 15,
    color: '#aaa',
  },
  text: {
    fontFamily: 'Righteous',
    fontSize: 24,
    color: '#fff',
  },
});
