import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/theme/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg_primary, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={COLORS.accent} size="large" />
    </View>
  );
}