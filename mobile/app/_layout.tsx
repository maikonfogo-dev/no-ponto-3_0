import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </LocationProvider>
    </AuthProvider>
  );
}
