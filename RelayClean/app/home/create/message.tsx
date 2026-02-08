import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function CreateMessageFromHomeScreen() {
  const router = useRouter() as any;
  const { addFromRelay } = useRelayStore();

  const [title, setTitle] = useState('');
  const [dueLabel, setDueLabel] = useState('Waiting 2 days');
  const [contact, setContact] = useState("Emma's teacher");

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Follow-up" subtitle="Track waiting responses" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Follow-up" />
          <FormField label="Message or follow-up" value={title} onChangeText={setTitle} />
          <FormField label="Contact" value={contact} onChangeText={setContact} />
          <FormField label="Timing" value={dueLabel} onChangeText={setDueLabel} />
        </GlassCard>

        <PrimaryButton
          label="Save follow-up"
          onPress={() => {
            addFromRelay([
              {
                id: 'single-message',
                title: `${title || 'Untitled follow-up'} · ${contact}`,
                type: 'message',
                dueLabel,
              },
            ]);
            router.replace('/home/follow-ups');
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
