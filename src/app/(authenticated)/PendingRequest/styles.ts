import { StyleSheet } from "react-native";



const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  atendenteImage: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#000",
  },
  timerContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  timerLabel: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
  },
  timerValue: {
    fontFamily: "Righteous",
    fontSize: 24,
    color: "#000",
  },
  warningTime: {
    color: "#FF3B30",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  detailValue: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#555",
    flex: 1,
    textAlign: "right",
  },
  pendingStatus: {
    color: "#FF9500",
    fontFamily: "Righteous",
  },
  acceptedStatus: {
    color: "#34C759",
    fontFamily: "Righteous",
  },
  actionButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#AEAEB2",
  },
  actionButtonText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#fff",
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
    marginTop: 20,
  },
  errorText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  noRequestText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#000",
  },
  retryButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "70%",
  },
  retryButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  message: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 10,
  },
  modalText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  bold: {
    fontFamily: "Righteous",
  },
  modalButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#fff",
  },
  lottie: {
    width: 230,
    height: 230,
    marginBottom: 10,
  },
});

export default styles;