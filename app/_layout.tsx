import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
        headerShown: false,
      }}
    />
  );
}
