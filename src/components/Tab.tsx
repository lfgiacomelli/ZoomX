import React, { memo, useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, AccessibilityInfo } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Tab = () => {
  const [statusLeitor, setStatusLeitor] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const routes: { path: string; icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { path: '/LastActivities', icon: 'file-tray-sharp', text: 'Atividades' },
    { path: '/MyPaymentsApproveds', icon: 'cash', text: 'Pagamentos' },
    { path: '/Home', icon: 'home-outline', text: 'Início' },
    { path: '/Profile', icon: 'person-outline', text: 'Perfil' },
    { path: '/Configuration', icon: 'settings-outline', text: 'Configurações' },
  ];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const isReducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
        setStatusLeitor(isReducedMotion);
        console.log("Status do leitor de tela:", isReducedMotion);
      } catch (error) {
        console.error("Erro ao obter o status do leitor de tela:", error);
      }
    };

    fetchStatus();
  }, []);

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const isActive = pathname.startsWith(route.path);

        return (
          <Pressable
            key={index}
            onPress={() => router.push(route.path)}
            accessibilityRole="button"
            accessibilityLabel={`Ir para a página ${route.text}`}
            accessibilityState={{ selected: isActive }}
            accessible={true}
            style={({ pressed }) => [
              styles.tabButton,
              isActive && styles.activeTab,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={route.icon}
              size={24}
              color={isActive ? '#000' : '#999'}
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            />
            <Text style={[styles.tabText, isActive && styles.activeText]}>
              {route.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default memo(Tab);

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
    flex: 1,
    paddingVertical: 6,
    marginTop: -10,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#000',
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  tabText: {
    fontFamily: 'Righteous',
    fontSize: 10.5,
    color: '#999',
  },
  activeText: {
    color: '#000',
  },
});
