import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { getFollowUpById } from '../demo-data';

export default function FollowUpDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const followUp = useMemo(() => getFollowUpById(id ?? ''), [id]);
  const [draft, setDraft] = useState(followUp?.aiDraft ?? '');
  const [talkOpen, setTalkOpen] = useState(false);

  if (!followUp) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <View style={styles.center}>
          <Text style={styles.empty}>Follow-up not found.</Text>
          <PrimaryButton label="Back" onPress={() => router.replace('/home/follow-ups')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Follow-Up Detail" subtitle={followUp.contact} onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Context" />
          <Text style={styles.contextTitle}>{followUp.title}</Text>
          <Text style={styles.contextMeta}>{followUp.dueLabel}</Text>
          <Text style={styles.contextBody}>{followUp.context}</Text>
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Suggested reply" />
          <FormField label="Draft" value={draft} onChangeText={setDraft} multiline />
        </GlassCard>

        <PrimaryButton
          label="Confirm send"
          onPress={() =>
            router.push({
              pathname: '/home/follow-ups/confirm',
              params: { mode: 'send', id: followUp.id, draft },
            })
          }
        />
        <SecondaryButton
          label="Send later"
          onPress={() =>
            router.push({
              pathname: '/home/follow-ups/confirm',
              params: { mode: 'later', id: followUp.id, draft },
            })
          }
        />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ds.spacing.s16,
    gap: ds.spacing.s12,
  },
  empty: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  contextTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  contextMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  contextBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
});
