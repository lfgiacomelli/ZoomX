import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
    },
    top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontFamily: 'Righteous',
        fontSize: 24,
        color: '#000',
    },
    addButton: {
        backgroundColor: '#000',
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    addressNickname: {
        fontFamily: 'Righteous',
        fontSize: 18,
        color: '#000',
    },
    addressText: {
        fontFamily: 'Righteous',
        fontSize: 14,
        color: '#555',
        marginVertical: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 15,
    },
    deleteButton: {
        marginLeft: 10,
    },
    emptyText: {
        fontFamily: 'Righteous',
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginTop: 50,
    },
    // Modal styles
    modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  padding: 20,
},

modalContainer: {
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 20,
  paddingVertical: 30,
  paddingHorizontal: 25,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 10,
  transform: [{ translateY: -10 }],
},

modalTitle: {
  fontFamily: 'Righteous',
  fontSize: 22,
  color: '#111',
  marginBottom: 25,
  textAlign: 'center',
},

input: {
  fontFamily: 'Righteous',
  height: 50,
  borderColor: '#e0e0e0',
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 15,
  marginBottom: 12,
  backgroundColor: '#fafafa',
  fontSize: 14,
},

modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 25,
},

modalButton: {
  borderRadius: 12,
  paddingVertical: 14,
  width: '48%',
  alignItems: 'center',
},

cancelButton: {
  backgroundColor: '#f3f3f3',
  borderWidth: 1,
  borderColor: '#ccc',
},

submitButton: {
  backgroundColor: '#000',
},

buttonText: {
  fontFamily: 'Righteous',
  fontSize: 14,
  color: '#fff',
},

cancelButtonText: {
  color: '#000',
},

});