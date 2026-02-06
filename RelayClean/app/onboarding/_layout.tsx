import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

export default function OnboardingLayout() {
  const { isComplete } = useOnboardingSession();

  if (isComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="value" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="voice" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
