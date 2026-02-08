import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../components/PetsShell';

export default function AddPetSuccessScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <PetsShell title="Pet Added" subtitle="Profile is ready" onBack={() => router.replace('/pets')}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Relay added your pet profile.</Text>
        <Text style={styles.body}>You can now track feedings, walks, meds, vaccines, vet visits, and notes.</Text>
      </GlassCard>

      <PrimaryButton label="Open profile" onPress={() => router.replace(id ? `/pets/profile/${id}` : '/pets')} />
      <SecondaryButton label="Back to Pets" onPress={() => router.replace('/pets')} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s8,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
