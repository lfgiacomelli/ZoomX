
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafa",
  },
  headerContainer: {
    paddingVertical: 20,
    backgroundColor: "#000",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Righteous",
    fontSize: 22,
    color: "#fff",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Righteous",
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#0066ff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#0066ff",
  },
  cardDate: {
    fontFamily: "Righteous",
    fontSize: 13,
    color: "#666",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: "Righteous",
    fontSize: 13,
    color: "#999",
    marginBottom: 3,
  },
  statusApproved: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#00aa00",
  },
  statusPending: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#e09b00",
  },
  statusRejected: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#d11a2a",
  },
  statusUnknown: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#555",
  },
  amountText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#222",
  },
  emptyImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  }
});

export default styles;