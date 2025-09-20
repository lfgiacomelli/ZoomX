import { useState, useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import styles from '../app/(authenticated)/RequestTravel/styles';

type LoadingProps = {
    isLoading: boolean,
    loadingMotorcycleAnimation: any;
}

const mensagens = [
    "Calculando rota...",
    "Achando o melhor caminho...",
    "Ajustando percurso...",
    "Quase pronto!"
];

export default function LoadingRota({ isLoading, loadingMotorcycleAnimation }: LoadingProps) {
    const [msgIndex, setMsgIndex] = useState(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (!isLoading) return;

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
    }, [isLoading, fadeAnim, translateY]);

    if (!isLoading) return null;

    return (
        <View style={styles.loadingContainer}>
            <LottieView
                source={loadingMotorcycleAnimation}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
            />
            <Animated.Text
                style={[
                    styles.loadingText,
                    {
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
