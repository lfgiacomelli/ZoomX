import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StatusBar, ScrollView, AccessibilityInfo, Button } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { mostrarDataHoraAtual } from "@utils/getDateTime";

import styles from "./styles";

import Header from "@components/Header";
import Geolocation from "@components/Geolocation";
import LastActivity from "@components/LastActivity";
import Services from "@components/Services";
import PendingTravel from "@components/PendingTravel";
import AvaliarViagem from "@components/AvaliarViagem";

import { useAuth } from "@contexts/useAuth";
import useRighteousFont from "@hooks/useFont/Righteous";
import { registerPushToken } from "@utils/registerPushToken";
import Benefits from "@components/Benefits";

export default function Home() {
    const router = useRouter();
    const fontLoaded = useRighteousFont();

    const { user, token } = useAuth();
    const userFirstName = user?.nome?.split(" ")[0] || "Usuário";

    const [statusLeitor, setStatusLeitor] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isMobileData, setIsMobileData] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);

    const hasInitialized = useRef(false);


    const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
        const { via_codigo } = response.notification.request.content.data;
        if (via_codigo) {
            router.push(`/AvaliarViagem/${via_codigo}`);
        }
    }, [router]);

    const checkScreenReader = useCallback(async () => {
        try {
            const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
            setStatusLeitor(isEnabled);
        } catch (err) {
            console.error("Erro ao verificar leitor de tela:", err);
        }
    }, []);

    useEffect(() => {
        mostrarDataHoraAtual();
        const registerToken = async () => {
            if (user && token) {
                await registerPushToken(user, token);
            }
        };
        registerToken();
    }, [user, token]);

    useEffect(() => {
        if (hasInitialized.current) return;

        checkScreenReader();

        AsyncStorage.getItem("userPhoto").then(setPhoto);

        const notificationListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
        const screenReaderSubscription = AccessibilityInfo.addEventListener("screenReaderChanged", setStatusLeitor);
        const netInfoUnsubscribe = NetInfo.addEventListener(state => setIsMobileData(state.type === "cellular"));

        hasInitialized.current = true;

        return () => {
            notificationListener.remove();
            screenReaderSubscription.remove();
            netInfoUnsubscribe();
        };

    }, [checkScreenReader, handleNotificationResponse]);

    if (!fontLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={30} color="#000" />
            </View>
        );
    }


    const loadPhoto = () => {
        if (photo) {
            return (
                <Image source={{ uri: photo }} style={styles.profileImage} />
            );
        } else {
            return (
                <Image source={require("@images/userPhotoDefault.png")} style={styles.profileImage} />
            )
        }
    }

    function verifyMobileData() {
        if (isMobileData) {
            return (
                <Text style={styles.welcomeSubtitle}>Você está usando dados móveis</Text>
            )
        }
    }

    return (
        <>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <Header disableNavigation />
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                accessible={true}
            >
                <View style={styles.headerSection}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.welcomeTitle}>Olá, {userFirstName}!</Text>
                        <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/Profile")}>
                            {loadPhoto()}
                        </TouchableOpacity>
                    </View>
                    {verifyMobileData()}
                </View>
                <PendingTravel />
                <AvaliarViagem />
                <Services />
                <Benefits />
                <LastActivity />
            </ScrollView>
        </>
    );
}
