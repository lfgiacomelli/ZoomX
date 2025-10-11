import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Modalize } from "react-native-modalize";
import LottieView from "lottie-react-native";
import { forwardRef, Ref } from "react"
type BottomSheetProps = {
    title: string;
    text: string;
    action?: () => void;
    animation: any;
    ref?: Ref<Modalize>;
    buttonTitle?: string;
    panGestureEnabled?: boolean;
}

export const BottomSheet = forwardRef<Modalize, BottomSheetProps>(
    ({ title, text, action, animation, buttonTitle, panGestureEnabled }, ref) => {
        return (
            <Modalize
                ref={ref}
                snapPoint={350}
                adjustToContentHeight
                useNativeDriver={true}
                withHandle={true}
                panGestureEnabled={panGestureEnabled}
            >
                <View style={styles.bottomSheetContent}>
                    <LottieView source={animation} autoPlay loop style={styles.animation} />
                    <Text style={styles.bottomSheetTitle}>{title}</Text>
                    <Text style={styles.bottomSheetText}>{text}</Text>
                    <TouchableOpacity style={styles.deactivateButton} onPress={action}>
                        <Text style={styles.deactivateText}>{buttonTitle}</Text>
                    </TouchableOpacity>
                </View>
            </Modalize>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        zIndex: 100,
        borderWidth: 2,
        borderColor: "#ccc",
        backgroundColor: "#f2f2f2",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
        borderTopColor: "#ccc",
    },
    handleIndicator: {
        backgroundColor: "#aaa",
        width: 40,
        height: 5,
        alignSelf: "center",
        marginVertical: 5,
        borderRadius: 3,
    },
    bottomSheetContent: {
        padding: 20,
        paddingBottom: 20
    },
    bottomSheetTitle: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: "center",
        color: "#000",
        fontFamily: "Righteous",
    },
    bottomSheetText: {
        fontSize: 16,
        textAlign: "center",
        color: "#000",
        fontFamily: "Righteous",
        marginBottom: 20,
    },
    animation: {
        width: 200,
        height: 200,
        alignSelf: "center",
        marginBottom: 10,
    },
    deactivateButton: {
        height: 45,
        backgroundColor: "#007BFF",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        marginTop: 20,
        gap: 8,
        elevation: 3,
    },
    deactivateText: {
        fontFamily: "Righteous",
        fontSize: 20,
        color: "#fff",
    },
})
