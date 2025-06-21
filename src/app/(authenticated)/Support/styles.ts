import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  animationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  lottie: {
    width: width * 0.7,
    height: width * 0.7,
  },
  textContainer: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Righteous",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#333333",
    textAlign: "justify",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Righteous",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#666666",
    marginTop: 24,
    textAlign: "center",
  },
});
export default styles;
