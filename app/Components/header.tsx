import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function Header() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.push('/home')}>
                <Image source={require('../../assets/logo.png')} style={{ width: 190, height: 140 }} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: '100%',
        backgroundColor: '#000',
        
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Righteous',
    },
});