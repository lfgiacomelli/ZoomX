import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ActivityIndicator, Button
} from 'react-native';
import Tab from '../Components/Tab';
import useRighteousFont from '../../hooks/Font';
import Header from '../Components/header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();
    const fontLoaded = useRighteousFont();
    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        router.replace('/login');
    };

    if (!fontLoaded) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Header />
            <View style={styles.container}>
                <Text style={styles.title}>Perfil do Usuário</Text>
                <Button title="Logout" onPress={handleLogout} />
            </View>
            <Tab />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: StatusBar.currentHeight || 40,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 22,
        fontFamily: 'Righteous',
        color: '#000',
        marginBottom: 20,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
