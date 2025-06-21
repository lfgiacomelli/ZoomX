import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontFamily: "Righteous",
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  cardTitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
  },
  cardDate: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
    marginRight: 8,
  },
  ratingStars: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#FFD700",
  },
  commentContainer: {
    marginTop: 8,
  },
  commentLabel: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  commentText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default styles;
