import React from 'react';
import { Stack } from 'expo-router';
import { PetsProvider } from './pets-context';

export default function PetsLayout() {
  return (
    <PetsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PetsProvider>
  );
}
