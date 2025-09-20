import { useState, useCallback, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

import styles from "../app/(authenticated)/Home/styles";

export default function Geolocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const startWatchingLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão negada para acessar localização");
        setLoading(false);
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Erro ao obter localização:", err);
      setErrorMsg("Erro ao obter localização");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startWatchingLocation();
  }, [startWatchingLocation]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sua Localização</Text>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
        ) : errorMsg ? (
          <Text style={{ color: "red", textAlign: "center" }}>{errorMsg}</Text>
        ) : location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton={false}
            toolbarEnabled={false}
          >
            <Marker coordinate={location} title="Sua localização" />
          </MapView>
        ) : (
          <Text style={{ textAlign: "center" }}>Localização não disponível</Text>
        )}
      </View>
    </View>
  );
}
