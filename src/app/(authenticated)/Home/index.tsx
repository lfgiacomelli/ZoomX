import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StatusBar, ScrollView, AccessibilityInfo, Button } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import styles from "./styles";

import Header from "@components/Header";
import LastActivity from "@components/LastActivity";
import Services from "@components/Services";
import PendingTravel from "@components/PendingTravel";
import AvaliarViagem from "@components/AvaliarViagem";

import { useAuth } from "@contexts/useAuth";
import useRighteousFont from "@hooks/useFont/Righteous";
import { registerPushToken } from "@utils/registerPushToken";

export default function Home() {
    const router = useRouter();
    const fontLoaded = useRighteousFont();

    const { user, token } = useAuth();
    const userFirstName = user?.nome?.split(" ")[0] || "Usuário";

    const [statusLeitor, setStatusLeitor] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isMobileData, setIsMobileData] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);

    const hasInitialized = useRef(false);

    const startWatchingLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permissão negada para acessar localização");
                return;
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (newLocation) => {
                    setLocation(newLocation.coords);
                }
            );
        } catch (err) {
            console.error("Erro ao obter localização:", err);
        }
    }, []);

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
        const registerToken = async () => {
            if (user && token) {
                await registerPushToken(user, token);
            }
        };
        registerToken();
    }, [user, token]);

    useEffect(() => {
        if (hasInitialized.current) return;

        startWatchingLocation();
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

    }, [startWatchingLocation, checkScreenReader, handleNotificationResponse]);

    if (!fontLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require("@images/logo.png")}
                    style={styles.loadingLogo}
                />
                <Text style={styles.loadingText}>Preparando tudo para você...</Text>
                <ActivityIndicator size={50} color="#000" />
            </View>
        );
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
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.profileImage} />
                            ) : (
                                <Image source={require("@images/userPhotoDefault.png")} style={styles.profileImage} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {isMobileData && (
                        <Text style={styles.welcomeSubtitle}>Você está usando dados móveis</Text>
                    )}
                </View>
                <Services />
                <AvaliarViagem />
                <PendingTravel />
                <LastActivity />

                {location && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sua Localização</Text>
                        </View>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                toolbarEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                    title="Sua localização"
                                />
                            </MapView>
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    );
}
