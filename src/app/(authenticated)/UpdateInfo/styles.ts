import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 22,
    marginBottom: 20,
    color: "#000",
  },
  label: {
    fontFamily: "Righteous",
    fontSize: 16,
    marginBottom: 6,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    height: 50,
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    fontFamily: "Righteous",
    fontSize: 15,
    color: "#000",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalText: {
    fontFamily: "Righteous",
    fontSize: 18,
    textAlign: "center",
    color: "#000",
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Righteous",
    fontSize: 16,
  },
});
export default styles;