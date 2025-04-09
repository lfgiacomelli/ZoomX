import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Tab() {
  const router = useRouter();
  const pathname = usePathname();

  const routes: { path: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { path: '/home', icon: 'home-outline' },
    { path: '/travels', icon: 'car-outline' },
    { path: '/profile', icon: 'person-outline' },
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
              size={28}
              color={isActive ? '#000' : '#999'}
            />
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
