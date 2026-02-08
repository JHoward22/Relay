import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../../components/PetsShell';
import { usePetsStore } from '../../pets-context';

export default function ArchivePetScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, archivePet } = usePetsStore();

  const pet = useMemo(() => getPet(id), [getPet, id]);

  return (
    <PetsShell title="Archive Pet" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>Archive this pet profile?</Text>
        <Text style={styles.body}>Archived pets are hidden from daily views, but can be restored later in future versions.</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.label}>This action affects reminders and schedule visibility.</Text>
        <Text style={styles.body}>Relay will stop surfacing this pet in daily snapshots.</Text>
      </GlassCard>

      <GlassCard blur style={styles.actions}>
        <BubbleChip
          icon="archive-outline"
          label="Archive"
          tone="danger"
          onPress={() => {
            if (pet) archivePet(pet.id);
            router.replace('/pets');
          }}
        />
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.back()} />
      </GlassCard>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  label: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
    marginBottom: ds.spacing.s4,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
