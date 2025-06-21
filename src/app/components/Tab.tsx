import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Tab() {
  const router = useRouter();
  const pathname = usePathname();

  const routes: { path: string; icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { path: '/Home', icon: 'home-outline', text: 'Home' },
    { path: '/LastActivities', icon: 'file-tray-sharp', text: 'Atividades' },
    { path: '/Profile', icon: 'person-outline', text: 'Perfil' },
    {path: '/Configuration', icon: 'settings-outline', text: 'Configurações' },
  ];

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const isActive = pathname.startsWith(route.path);

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(route.path)}
            style={[styles.tabButton, isActive && styles.activeTab]}
          >
            <Ionicons
              name={route.icon}
              size={24}
              color={isActive ? '#000' : '#999'}
            />
            <Text style={{ color: isActive ? '#000' : '#999', fontFamily: 'Righteous', fontSize: 13 }}>{route.text}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 6,
    flex: 1,
    marginTop: -10,
  },
  activeTab: {
    borderTopWidth: 3,
    marginTop: -10,
    marginBottom: 10,
    borderTopColor: '#000',
  },

});
