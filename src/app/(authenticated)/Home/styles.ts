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
    borderRadius: 16,
    padding: 20,
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
  },
  map: {
    width: "100%",
    height: "100%",
  },

  adsSection: {
    marginBottom: 24,
  },
  profileButton: {
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 8,
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    
  }
});

export default styles;
