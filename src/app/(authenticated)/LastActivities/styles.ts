import { StyleSheet } from "react-native";
import Constants from "expo-constants";


const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: Constants.statusBarHeight + 10,
        paddingBottom: 100,
    },
    title: {
        fontSize: 26,
        fontFamily: "Righteous",
        marginBottom: 16,
        color: "#000",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000",
        borderRadius: 21,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        width: 355,
        minHeight: 70,
    },
    cardExpanded: {
        paddingBottom: 20,
    },
    icon: {
        width: 69,
        height: 69,
        resizeMode: "contain",
        marginRight: 16,
    },
    label: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#aaa",
    },
    text: {
        fontFamily: "Righteous",
        fontSize: 24,
        color: "#fff",
        marginTop: -2,
    },
    detail: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#fff",
        marginTop: 4,
    },
    dateContainer: {
        marginLeft: 10,
        alignItems: "flex-end",
    },
    error: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginVertical: 20,
        fontFamily: "Righteous",
    },
    empty: {
        fontSize: 24,
        color: "#555",
        textAlign: "center",
        marginVertical: 20,
        fontFamily: "Righteous",
    },
    iconEmpty: {
        width: 300,
        height: 300,
        alignSelf: "center",
        marginBottom: 10,
    },
    newRequest: {
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 21,
        alignItems: "center",
        marginTop: 20,
    },
    newRequestText: {
        textDecorationLine: "underline",
        fontFamily: "Righteous",
        fontSize: 18,
        color: "#fff",
        textAlign: "center",
    },
    iconError: {
        width: 220,
        height: 220,
        alignSelf: "center",
        marginBottom: 10,
    },
    errorTitle: {
        fontSize: 22,
        fontFamily: "Righteous",
        color: "#000",
        textAlign: "center",
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        fontFamily: "Righteous",
        color: "#777",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontFamily: 'Righteous',
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingAnimation: {
    width: 220,
    height: 220,
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
