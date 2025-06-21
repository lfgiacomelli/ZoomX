import { View, Text, StyleSheet, Image } from 'react-native';
import styles from './styles';

import Header from '@components/header';
import Tab from '@components/Tab';
import useRighteousFont from '@hooks/Font/Righteous';


export default function AboutApp() {
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
                <Image source={require('@images/fordevslogo.png')} style={styles.logo} />
                <View style={styles.versionBox}>
                    <Text style={styles.storyText}>Versão:</Text>
                    <Text style={styles.storyText}>1.0.0 BETA</Text>
                </View>
            </View>
            <Tab />
        </>
    );
}
