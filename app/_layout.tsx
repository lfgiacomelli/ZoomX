import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
