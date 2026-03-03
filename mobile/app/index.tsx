import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Simulate auth check
    // In real app, check for valid token here
    setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NO PONTO 3.0</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
