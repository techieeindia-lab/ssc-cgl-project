import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/theme/colors';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={COLORS.bg_primary} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="exam/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="exam/pyst"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="exam/sectional"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="exam/pyq"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="exam/result"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}