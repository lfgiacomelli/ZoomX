import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorText: {
    fontFamily: "Righteous",
    color: "#d32f2f",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  notFoundText: {
    fontFamily: "Righteous",
    color: "#000",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontFamily: "Righteous",
    fontSize: 22,
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  value: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  price: {
    color: "#2e7d32",
    fontFamily: "Righteous",
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: "center",
    overflow: "hidden",
  },
  statusConfirmed: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  statusPending: {
    backgroundColor: "#ffebee",
    color: "#f57f17",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  shareButton: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    fontFamily: "Righteous",
    color: "#fff",
    fontSize: 16,
  },
});

export default styles;