import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image, ActivityIndicator } from 'react-native';
import PagerView from 'react-native-pager-view';

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = width * 0.55;

type Anuncio = {
    anu_codigo: number;
    anu_foto?: string;
};

export default function AnunciosCarousel() {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [loading, setLoading] = useState(true);
    const pagerRef = useRef<PagerView>(null);
    const currentPageRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function fetchAnuncios() {
            try {
                const response = await fetch('https://backend-turma-a-2025.onrender.com/api/anuncios');
                if (!response.ok) throw new Error('Falha ao carregar anúncios');
                const data = await response.json();
                setAnuncios(data.filter((item: Anuncio) => item.anu_foto));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchAnuncios();

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (anuncios.length <= 1) return;

        intervalRef.current = setInterval(() => {
            const nextPage = (currentPageRef.current + 1) % anuncios.length;
            pagerRef.current?.setPage(nextPage);
        }, 4000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [anuncios]);

    const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
        currentPageRef.current = e.nativeEvent.position;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
            </View>
        );
    }

    if (!anuncios.length) {
        return null;
    }

    return (
        <PagerView
            style={styles.container}
            initialPage={0}
            ref={pagerRef}
            onPageSelected={handlePageSelected}
            overdrag={false}
        >
            {anuncios.map((anuncio) => (
                <View key={String(anuncio.anu_codigo)} style={styles.page}>
                    <View style={styles.card}>
                        <Image
                            source={{ uri: anuncio.anu_foto }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {/* Opcional: overlay para texto */}
                        {/* <View style={styles.overlay}>
              <Text style={styles.text}>Descrição do anúncio</Text>
            </View> */}
                    </View>
                </View>
            ))}
        </PagerView>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height: CAROUSEL_HEIGHT,
        backgroundColor: '#FAFAFA',
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width * 0.82,
        height: CAROUSEL_HEIGHT * 0.9,
        borderRadius: 18,
        backgroundColor: '#FFF',
        marginHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 15,
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        width,
        height: CAROUSEL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
