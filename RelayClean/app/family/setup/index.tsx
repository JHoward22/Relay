import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilySetupScreen() {
  const router = useRouter() as any;
  const { createFamily, state } = useFamilyStore();
  const { setFamilyMode } = useRelayStore();
  const [name, setName] = useState(state.family?.name ?? 'My Household');

  return (
    <FamilyShell title="Create Family" subtitle="Optional shared household setup" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.copy}>
          Relay can coordinate chores, events, notes, and shopping with clear permissions for each member.
        </Text>
        <FormField label="Family name" value={name} onChangeText={setName} placeholder="Howard Household" />
        <View style={styles.benefitRow}>
          <BubbleChip icon="checkmark" label="Shared tasks" tone="success" onPress={() => router.push('/family/tasks')} />
          <BubbleChip icon="checkmark" label="Family calendar" tone="success" onPress={() => router.push('/family/calendar')} />
          <BubbleChip icon="checkmark" label="Member roles" tone="success" onPress={() => router.push('/family/settings')} />
        </View>
      </GlassCard>

      <PrimaryButton
        label="Create family"
        onPress={() => {
          createFamily(name.trim() || 'My Household');
          setFamilyMode(true);
          router.replace('/family');
        }}
      />
      <SecondaryButton
        label="Skip for now"
        onPress={() => {
          setFamilyMode(false);
          router.replace('/');
        }}
      />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  copy: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
    marginBottom: ds.spacing.s12,
  },
  benefitRow: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
