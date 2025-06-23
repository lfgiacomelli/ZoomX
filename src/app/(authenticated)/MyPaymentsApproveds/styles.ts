// styles.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
    },
    header: {
        padding: 20,
        backgroundColor: "#000",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 10,
    },
    headerTitle: {
        fontFamily: "Righteous",
        fontSize: 24,
        color: "#fff",
        textAlign: "center",
        letterSpacing: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    emptyTitle: {
        fontFamily: "Righteous",
        fontSize: 20,
        color: "#000",
        textAlign: "center",
        marginBottom: 15,
    },
    emptyText: {
        fontFamily: "Righteous",
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    listContent: {
        padding: 15,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: "#0066ff",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 10,
    },
    cardTitle: {
        fontFamily: "Righteous",
        fontSize: 16,
        color: "#0066ff",
    },
    cardDate: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#666",
    },
    paymentInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusApproved: {
        color: "#00aa00",
        fontFamily: "Righteous",
    },
    statusPending: {
        color: "#ff9900",
        fontFamily: "Righteous",
    },
    statusRejected: {
        color: "#ff0000",
        fontFamily: "Righteous",
    },
    amountText: {
        fontFamily: "Righteous",
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    refreshControl: {
        backgroundColor: "#f8f9fa",
    },
});