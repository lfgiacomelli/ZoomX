import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 24,
    marginBottom: 24,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  whiteButton: {
    height: 40,
    width: 172,
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
    padding: 8,
  },
  whiteButtonText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },
  switchContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  switchText: {
    fontFamily: "Righteous",
    fontSize: 24,
    color: "#000",
    marginLeft: 8,
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
  logoutButton: {
    backgroundColor: "#DB2E05",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginTop: 12,
    gap: 8,
    elevation: 3,
    height: 45,
  },
  logoutText: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#fff",
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    width: "100%",
    elevation: 2,
  },

  textContainer: {
    flex: 1,
    alignItems: "center",
  },

  dropdownText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
  },

  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  iconText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
});

export default styles;