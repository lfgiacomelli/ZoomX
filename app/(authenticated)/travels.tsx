import { View, Text, StyleSheet } from 'react-native';
import Tab from '../Components/Tab';
import useRighteousFont from '../../hooks/Font/index';
import Header from '../Components/header';

export default function Travels() {
    const fontLoaded = useRighteousFont();

    if (!fontLoaded) return null;

    return (
        <>
            <Header />
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <Text style={styles.title}>Minhas Viagens</Text>
                    <Text style={styles.subtitle}>Aqui você verá o histórico das suas corridas.</Text>
                </View>
                <Tab />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Righteous',
        marginBottom: 10,
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        fontFamily: 'Righteous',
    },
});
