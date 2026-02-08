import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ThemeProvider as RestyleThemeProvider } from '@shopify/restyle';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useOnboardingSession } from '@/hooks/use-onboarding-session';
import { RelayStoreProvider } from '@/store/relay-store';
import { relayTheme } from '@/theme/restyle';
import { AIMemoryProvider } from '@/app/ai/ai-memory-context';

export default function RootLayout() {
  const { isComplete } = useOnboardingSession();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RelayStoreProvider>
        <AIMemoryProvider>
          <RestyleThemeProvider theme={relayTheme}>
            <ThemeProvider value={DefaultTheme}>
              <BottomSheetModalProvider>
                <Stack>
                  {!isComplete ? <Stack.Screen name="onboarding" options={{ headerShown: false }} /> : null}
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="home" options={{ headerShown: false }} />
                  <Stack.Screen name="tasks" options={{ headerShown: false }} />
                  <Stack.Screen name="calendar" options={{ headerShown: false }} />
                  <Stack.Screen name="settings" options={{ headerShown: false }} />
                  <Stack.Screen name="meals" options={{ headerShown: false }} />
                  <Stack.Screen name="finances" options={{ headerShown: false }} />
                  <Stack.Screen name="pets" options={{ headerShown: false }} />
                  <Stack.Screen name="notes" options={{ headerShown: false }} />
                  <Stack.Screen name="family" options={{ headerShown: false }} />
                  <Stack.Screen name="ai" options={{ headerShown: false }} />
                  <Stack.Screen name="relay" options={{ headerShown: false }} />
                  <Stack.Screen name="life-hub" options={{ headerShown: false }} />
                  <Stack.Screen name="pro" options={{ headerShown: false }} />
                  <Stack.Screen name="trust" options={{ headerShown: false }} />
                  <Stack.Screen name="help" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="dark" />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </RestyleThemeProvider>
        </AIMemoryProvider>
      </RelayStoreProvider>
    </GestureHandlerRootView>
  );
}
