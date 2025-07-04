import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  form: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: "#f0f0f0",
  },
  iconColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  row:{
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: "#000",
    marginVertical: 4,
  },
  inputColumn: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "Righteous",
    color: "#000",
  },
  loadingContainer: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flexDirection: "column",
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    fontFamily: "Righteous",
  },
  mapContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  map: {
    flex: 1,
  },
  bottomSheetBackground: {
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#f2f2f2",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderStartEndRadius: 0,
    borderEndEndRadius: 0,
    borderTopColor: "#ccc",
  },
  handleIndicator: {
    backgroundColor: "#aaa",
    width: 40,
    height: 5,
    alignSelf: "center",
    marginVertical: 5,
    borderRadius: 3,
  },
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
    fontFamily: "Righteous",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  detailLabel: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Righteous",
  },
  detailValue: {
    fontSize: 16,
    color: "#000",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 10,
    fontFamily: "Righteous",
  },
  priceText: {
    color: "#2e7d32",
    fontFamily: "Righteous",
  },
  paymentMethodContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  paymentMethodLabel: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontFamily: "Righteous",
  },
  paymentMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
  },
  paymentMethodButtonText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Righteous",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Righteous",
  },
  paymentMethodsList: {
    marginBottom: 20,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  paymentMethodItemPressed: {
    backgroundColor: "#f5f5f5",
  },
  paymentMethodItemSelected: {
    backgroundColor: "#f0f0f0",
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#666",
    fontFamily: "Righteous",
  },
  paymentMethodTextSelected: {
    color: "#000",
    fontFamily: "Righteous",
  },
  modalCloseButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",
  },
  solicitarButton: {
    backgroundColor: "#000",
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  solicitarButtonText: {
    color: "#f0f0f0",
    fontSize: 18,
    fontFamily: "Righteous",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Righteous",
    marginRight: 8,
  },
  apagar: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  suggestionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  column: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  suggestionTitle: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  suggestionAddress: {
    fontFamily: "Righteous",
    fontSize: 16,
  },
  comeBack: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#000",
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  lupaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginVertical: 5,
  },
  lupaText: {
    fontFamily: "Righteous",
    fontSize: 16,
    color: "#000",
    marginRight: 8,
    letterSpacing: 0.5,
  },
  lupaButtonPressed: {
    backgroundColor: "#000",
  },
  lupaTextPressed: {
    color: "#fff",
  },
});
export default styles;