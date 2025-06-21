import { StyleSheet, StatusBar } from 'react-native';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
  },
  serviceIcon: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingLogo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  loadingText: {
    fontFamily: "Righteous",
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight || 24,
    paddingBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  welcomeTitle: {
    fontFamily: "Righteous",
    fontSize: 28,
    color: "#000",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Righteous",
    fontSize: 20,
    color: "#000",
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  map: {
    width: "100%",
    height: "100%",
  },

  adsSection: {
    marginBottom: 24,
  },
  // solicitarButton: {
  //   width: 200,
  //   position: "absolute",
  //   bottom: 100,
  //   right: 20,
  //   backgroundColor: "#000",
  //   borderRadius: 50,
  //   padding: 16,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 4,
  //   flexDirection: "row",
  // },
  // solicitarButtonText: {
  //   color: "#fff",
  //   fontFamily: "Righteous",
  //   fontSize: 16,
  //   marginTop: 4,
  // },
  profileButton: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 8,
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
