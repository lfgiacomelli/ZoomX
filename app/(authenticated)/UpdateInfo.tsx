import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import useRighteousFont from '../../hooks/Font';
import Header from '../Components/header';
import Tab from '../Components/Tab';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function EditProfile() {
    const fontLoaded = useRighteousFont();
    const [passwordVisible, setPasswordVisible] = useState(false);

    if (!fontLoaded) return null;

    return (
        <>
            <Header />
            <View style={styles.container}>
                <Text style={styles.title}>Tem algo de errado?{"\n"}Corrija aqui!</Text>

                <Text style={styles.label}>Nome completo:</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder="4ForDevs" />
                    <Ionicons name="person" size={22} color="black" />
                </View>

                <Text style={styles.label}>E-mail:</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder="4fordevs@email.com" keyboardType="email-address" />
                    <Ionicons name="mail" size={22} color="black" />
                </View>

                <Text style={styles.label}>Telefone:</Text>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                    <Ionicons name="call" size={22} color="black" />
                </View>

                <Text style={styles.label}>Senha:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!passwordVisible}
                        placeholder="********"
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={22} color="black" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Atualizar Informações</Text>
                </TouchableOpacity>
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
        fontSize: 22,
        marginBottom: 20,
        color: '#000',
    },
    label: {
        fontFamily: 'Righteous',
        fontSize: 16,
        marginBottom: 6,
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        height: 50,
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        fontFamily: 'Righteous',
        fontSize: 15,
        color: '#000',
    },
    icon: {
        width: 22,
        height: 22,
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontFamily: 'Righteous',
        fontSize: 16,
        color: '#fff',
    },
});
