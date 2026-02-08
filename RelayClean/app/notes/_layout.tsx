import React from 'react';
import { Stack } from 'expo-router';
import { NotesProvider } from './notes-context';

export default function NotesLayout() {
  return (
    <NotesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </NotesProvider>
  );
}
