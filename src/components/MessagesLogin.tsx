import { useState, useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import styles from '../app/(authenticated)/RequestTravel/styles';

type LoadingProps = {
    loading: boolean,
}

const mensagens = [
    "Enviando seus dados",
    "Verificando suas credenciais",
    "Autenticando",
    "Quase lá!"
];

export default function MessagesLogin({ loading }: LoadingProps) {
    const [msgIndex, setMsgIndex] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (!loading) return;

        const animateText = () => {
            fadeAnim.setValue(0);
            translateY.setValue(20);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }).start(() => {
                        setMsgIndex(prev => (prev + 1) % mensagens.length);
                    });
                }, 500);
            });
        }

        animateText();
        const interval = setInterval(animateText, 2000);

        return () => clearInterval(interval);
    }, [loading, fadeAnim, translateY]);

    if (!loading) return null;

    return (
        <View style={{ position: "relative", top: -60 }}>
            <Animated.Text
                style={[
                    styles.loadingText,
                    {
                        textAlign: "center",
                        fontSize: 24,
                        color: "#fff",
                        opacity: fadeAnim,
                        transform: [{ translateY }]
                    }
                ]}
            >
                {mensagens[msgIndex]}
            </Animated.Text>
        </View>
    );
}

