import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Animated,
    Modal,
    Dimensions,
    Pressable,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Header from '../Components/header';
import Tab from '../Components/Tab';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const screenHeight = Dimensions.get('window').height;

const socket = io("https://obscure-garbanzo-pxqrqxxp55xcrggg-3000.app.github.dev", {
    transports: ["websocket", "polling"],
    withCredentials: true,
});

export default function RequestTravel() {
    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [region, setRegion] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [enderecoPartida, setEnderecoPartida] = useState('');
    const [enderecoDestino, setEnderecoDestino] = useState('');
    const [resposta, setResposta] = useState('');
    const [aguardando, setAguardando] = useState(false);
    const [nome, setNome] = useState('Giacomelli');
    const [tipo, setTipo] = useState('Moto Táxi');
    const [timer, setTimer] = useState(60);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permissão de localização negada');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            setRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            fetchEndereco(loc.coords.latitude, loc.coords.longitude);
        })();
    }, []);

    useEffect(() => {
        socket.on('solicitacaoAtualizada', (dados) => {
            setResposta(dados.status);
            setAguardando(false);
            if (timerInterval) clearInterval(timerInterval);
        });

        return () => {
            socket.off('solicitacaoAtualizada');
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [timerInterval]);

    const fetchEndereco = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                    headers: {
                        "User-Agent": "mobile/1.0 (lfgiacomellirodrigues@gmail.com)",
                    },
                }
            );
            const data = await res.json();
            const { road, house_number } = data.address;
            setEnderecoPartida(`${road || "Rua desconhecida"}, ${house_number || "s/n"}`);
        } catch (error) {
            console.error("Erro ao buscar endereço:", error);
        }
    };

    const openModal = () => {
        setModalVisible(true);
        Animated.timing(slideAnim, {
            toValue: screenHeight / 2.4,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 400,
            useNativeDriver: false,
        }).start(() => {
            setModalVisible(false);
            setResposta('');
            setAguardando(false);
        });
    };

    const confirmarSolicitacao = () => {
        const novaSolicitacao = {
            id: Date.now(),
            nome,
            tipo,
            enderecoPartida,
            enderecoDestino,
            status: "Pendente",
        };

        socket.emit("novaSolicitacao", novaSolicitacao);
        setResposta('');
        setAguardando(true);
        setTimer(60);

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setResposta("Expirado");
                    setAguardando(false);
                }
                return prev - 1;
            });
        }, 1000);

        setTimerInterval(interval);
    };

    return (
        <>
            <Header />
            <View style={styles.container}>
                <View style={styles.mapWrapper}>
                    {region && (
                        <MapView
                            style={styles.map}
                            region={region}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                        >
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.coords.latitude,
                                        longitude: location.coords.longitude,
                                    }}
                                    title="Você está aqui"
                                />
                            )}
                        </MapView>
                    )}
                </View>

                <TouchableOpacity style={styles.button} onPress={openModal}>
                    <Image
                        source={require('../../assets/motorcycle.png')}
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Solicitar{"\n"}Moto Táxi</Text>
                </TouchableOpacity>
            </View>

            <Modal transparent visible={modalVisible} animationType="none">
                <Pressable style={styles.overlay} onPress={closeModal} />
                <Animated.View style={[styles.popup, { top: slideAnim }]}>
                    <View style={styles.popupHeader}>
                        <Text style={styles.popupTitle}>Moto Táxi</Text>
                        <Image
                            source={require('../../assets/motorcycle.png')}
                            style={styles.popupIcon}
                        />
                    </View>

                    <TextInput
                        placeholder="Endereço de embarque"
                        style={styles.input}
                        placeholderTextColor="#888"
                        value={enderecoPartida}
                        onChangeText={setEnderecoPartida}
                    />
                    <TextInput
                        placeholder="Insira o destino"
                        style={styles.input}
                        placeholderTextColor="#888"
                        value={enderecoDestino}
                        onChangeText={setEnderecoDestino}
                    />

                    {aguardando ? (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <ActivityIndicator size="large" color="#FF4500" />
                            <Text style={{ color: '#FF4500', marginTop: 10 }}>{timer}s</Text>
                        </View>
                    ) : resposta ? (
                        <Text style={styles.resposta}>
                            {resposta === "Aceito"
                                ? "Corrida aceita!"
                                : resposta === "Recusada"
                                    ? "Corrida recusada!"
                                    : "Tempo expirado!"}
                        </Text>
                    ) : (
                        <TouchableOpacity style={styles.confirmButton} onPress={confirmarSolicitacao}>
                            <Text style={styles.confirmText}>Confirmar</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </Modal>

            <Tab />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#F5F5F5",
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: "#FFF",
    },
    picker: {
        height: 50,
        marginBottom: 10,
    },
    map: {
        width: "100%",
        height: 200,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    statusImage: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    timer: {
        marginTop: 20,
        fontSize: 20,
        color: "#FF4500",
        fontWeight: "bold",
    },
    resposta: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: "bold",
        color: "#007BFF",
    },
    viewMap: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        height: "auto",
        borderColor: "#007BFF",
    },
    mapWrapper: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF4500',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    buttonIcon: {
        width: 50,
        height: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popup: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
    },
    popupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    popupTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    popupIcon: {
        width: 40,
        height: 40,
    },
    confirmButton: {
        backgroundColor: '#FF4500',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        marginTop: 20,
        width: '100%',
        height: 50,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});
