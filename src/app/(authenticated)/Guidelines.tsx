import { View, Text, StyleSheet } from 'react-native';

import Header from '@components/header';
import Tab from '@components/Tab';
import useRighteousFont from '@hooks/Font';

export default function Guidelines() {
  const fontLoaded = useRighteousFont();

  if (!fontLoaded) return null;

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>
          Quais são as nossas{"\n"}Políticas e Diretrizes?
        </Text>

        <View style={styles.box}>
          <Text style={styles.text}>
            Privacidade - Proteção total dos dados dos usuários.{"\n"}
            Cancelamento - Regras claras para evitar abusos.{"\n"}
            Uso Responsável - Respeito entre usuários e motoristas.
          </Text>
        </View>
        <Text style={styles.message}>
          Use o ZoomX com responsabilidade!
        </Text>
      </View>
      <Tab />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'Righteous',
    fontSize: 30,
    color: '#000',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  text: {
    fontFamily: 'Righteous',
    fontSize: 20,
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  message: {
    fontFamily: 'Righteous',
    fontSize: 30,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  }
});
