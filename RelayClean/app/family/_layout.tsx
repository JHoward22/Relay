import React from 'react';
import { Stack } from 'expo-router';
import { FamilyProvider } from './family-context';

export default function FamilyLayout() {
  return (
    <FamilyProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FamilyProvider>
  );
}
