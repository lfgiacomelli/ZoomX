import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

type HeaderProps = {
  disableNavigation?: boolean;
};

export default function Header({ disableNavigation = false }: HeaderProps) {
  const router = useRouter();

  const handlePress = () => {
    if (!disableNavigation) {
      router.push('/Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <TouchableOpacity onPress={handlePress} disabled={disableNavigation}>
        <Image source={require('@images/logo.png')} style={{ width: 190, height: 140 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60 + Constants.statusBarHeight,
    width: '100%',
    backgroundColor: '#000',
  },
});
