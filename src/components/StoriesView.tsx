import React, { useRef, useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    Image,
    Dimensions,
    Animated,
    TouchableWithoutFeedback,
} from "react-native";

const { width } = Dimensions.get("window");

type Story = {
    id: string;
    imageUrl: string;
    duration?: number;
};

export default function StoriesView() {
    const stories: Story[] = [
        {
            id: "1",
            imageUrl: "https://institucional.ifood.com.br/wp-content/uploads/2024/12/o-que-e-ads-no-ifood-768x576.jpg",
        },
        {
            id: "2",
            imageUrl: "https://framerusercontent.com/images/eQj5kkmvyvzkSAOWRax4aCGJsE.jpg",
        },
        {
            id: "3",
            imageUrl: "https://t.ctcdn.com.br/DLPD1nnRVF5vyh9-fsMMa711ES0=/640x360/smart/i568220.png",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const progressAnims = useRef(stories.map(() => new Animated.Value(0))).current;
    const flatListRef = useRef<FlatList>(null);

    const STORY_DURATION = 5000;

    useEffect(() => {
        if (currentIndex === 0) {
            progressAnims.forEach(anim => anim.setValue(0));
        }
        
        startAnimation(currentIndex);

        return () => {
            progressAnims.forEach(anim => anim.stopAnimation());
        };
    }, [currentIndex]);

    const startAnimation = (index: number) => {
        progressAnims.forEach(anim => anim.stopAnimation());
        
        progressAnims.forEach((anim, i) => {
            anim.setValue(i < index ? 1 : 0);
        });

        Animated.timing(progressAnims[index], {
            toValue: 1,
            duration: stories[index].duration || STORY_DURATION,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                const nextIndex = index < stories.length - 1 ? index + 1 : 0;
                setCurrentIndex(nextIndex);
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            }
        });
    };

    const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        }
    }).current;

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 80,
    };

    const CARD_WIDTH = width * 0.9;
    const CARD_HEIGHT = CARD_WIDTH * 0.6;

    return (
        <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <View style={styles.progressBarContainer}>
                {stories.map((_, i) => (
                    <View key={i} style={styles.progressBackground}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnims[i].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%'],
                                    }),
                                    backgroundColor: i === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
                                },
                            ]}
                        />
                    </View>
                ))}
            </View>

            <FlatList
                ref={flatListRef}
                data={stories}
                horizontal
                pagingEnabled
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableWithoutFeedback>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={[styles.image, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
                        />
                    </TouchableWithoutFeedback>
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        backgroundColor: "#000",
        overflow: "hidden",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    progressBarContainer: {
        flexDirection: "row",
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
        gap: 4,
    },
    progressBackground: {
        flex: 1,
        height: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        borderRadius: 3,
    },
    image: {
        resizeMode: "cover",
    },
});