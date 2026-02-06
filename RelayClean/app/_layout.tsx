import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useOnboardingSession } from '@/hooks/use-onboarding-session';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RelayStoreProvider } from '@/store/relay-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isComplete } = useOnboardingSession();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RelayStoreProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {!isComplete ? <Stack.Screen name="onboarding" options={{ headerShown: false }} /> : null}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="tasks" options={{ headerShown: false }} />
            <Stack.Screen name="calendar" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="relay" options={{ headerShown: false }} />
            <Stack.Screen name="pro" options={{ headerShown: false }} />
            <Stack.Screen name="trust" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </RelayStoreProvider>
    </GestureHandlerRootView>
  );
}
