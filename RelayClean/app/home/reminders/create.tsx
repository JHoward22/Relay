import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';

export default function ReminderCreateScreen() {
  const router = useRouter() as any;
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('Tomorrow · 9:00 AM');
  const [repeat, setRepeat] = useState('None');
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Reminder" subtitle="Voice-first, manual always available" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Reminder details" />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Take vitamins" />
          <FormField label="When" value={due} onChangeText={setDue} />
          <FormField label="Repeat" value={repeat} onChangeText={setRepeat} />
          <Text style={styles.hint}>Relay will ask for confirmation before saving.</Text>
        </GlassCard>

        <PrimaryButton
          label="Continue to confirm"
          onPress={() =>
            router.push({
              pathname: '/home/reminders/confirm',
              params: { title: title || 'Untitled reminder', due, repeat, mode: 'create' },
            })
          }
        />
        <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
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
  hint: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
