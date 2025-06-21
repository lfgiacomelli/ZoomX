import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    title: {
        fontFamily: 'Righteous',
        fontSize: 32,
        color: '#000',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Righteous',
        fontSize: 26,
        color: '#000',
        marginBottom: 6,
    },
    storyBox: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    storyText: {
        fontFamily: 'Righteous',
        fontSize: 20,
        color: '#fff',
    },
    logo: {
        width: 190,
        height: 190,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'Righteous',
        fontSize: 16,
        color: '#000',
        marginRight: 8,
    },
    homeIcon: {
        width: 24,
        height: 24,
    },
    versionBox: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});

export default styles;