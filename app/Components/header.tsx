import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function Header() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <TouchableOpacity onPress={() => router.push('/Home')}>
                <Image source={require('../../assets/logo.png')} style={{ width: 190, height: 140 }} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Constants.statusBarHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60 + Constants.statusBarHeight,
        width: '100%',
        backgroundColor: '#000',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Righteous',
    },
});
