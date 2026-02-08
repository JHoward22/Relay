import React from 'react';
import { Stack } from 'expo-router';
import { MealsProvider } from './meals-context';

export default function MealsLayout() {
  return (
    <MealsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MealsProvider>
  );
}
