import React from 'react';
import { Stack } from 'expo-router';
import { FinancesProvider } from './finances-context';

export default function FinancesLayout() {
  return (
    <FinancesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FinancesProvider>
  );
}
