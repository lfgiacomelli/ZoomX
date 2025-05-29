import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Tab from '../Components/Tab';
import useRighteousFont from '../../hooks/Font/index';
import Header from '../Components/header';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function AboutApp() {
    const router = useRouter();
    const fontLoaded = useRighteousFont();

    if (!fontLoaded) return null;  

    return (
        <>
            <Header />
            <View style={styles.container}>
                <Text style={styles.title}>Conheça o ZoomX:</Text>

                <Text style={styles.sectionTitle}>História:</Text>
                <View style={styles.storyBox}>
                    <Text style={styles.storyText}>
                        O ZoomX é um APP voltado ao mundo dos Moto Táxis, faça viagens e entregas utilizando nossos serviços.
                        A empresa fornecedora é situada em Presidente Venceslau, então sem preocupações!
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Desenvolvido por:</Text>
                <Image source={require('../../assets/fordevslogo.png')} style={styles.logo} />
                <View style={styles.versionBox}>
                    <Text style={styles.storyText}>Versão:</Text>
                    <Text style={styles.storyText}>1.0.0 BETA</Text>
                </View>
            </View>
            <Tab />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    title: {
        fontFamily: 'Righteous',
        fontSize: 32,
        color: '#000',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Righteous',
        fontSize: 26,
        color: '#000',
        marginBottom: 6,
    },
    storyBox: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    storyText: {
        fontFamily: 'Righteous',
        fontSize: 20,
        color: '#fff',
    },
    logo: {
        width: 190,
        height: 190,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Righteous',
        fontSize: 16,
        color: '#000',
        marginRight: 8,
    },
    homeIcon: {
        width: 24,
        height: 24,
    },
    versionBox: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});
