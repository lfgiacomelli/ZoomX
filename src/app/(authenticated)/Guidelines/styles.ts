import { StyleSheet } from 'react-native';

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
    textAlign: 'center',
  },
  intro: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  box: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
  },
  sectionTitle: {
    fontFamily: 'Righteous',
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontFamily: 'Righteous',
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default styles;
