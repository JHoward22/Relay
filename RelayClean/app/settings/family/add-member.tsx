import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function AddMemberScreen() {
  const router = useRouter() as any;
  const { addMember } = useRelayStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Family');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Add Member" subtitle="People and pets can share items" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Member" />
          <FormField label="Name" value={name} onChangeText={setName} />
          <FormField label="Role" value={role} onChangeText={setRole} />
        </GlassCard>

        <PrimaryButton
          label="Save member"
          onPress={() => {
            addMember({ name: name || 'New member', role: role || 'Family' });
            router.replace('/settings/family');
          }}
        />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
