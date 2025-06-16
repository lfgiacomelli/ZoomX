import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
