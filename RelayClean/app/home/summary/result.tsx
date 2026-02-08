import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';

function summaryCopy(range: string, type: string) {
  const rangeLabel = range === 'week' ? 'this week' : range === 'custom' ? 'your custom window' : 'today';
  if (type === 'completed') {
    return `You completed key follow-through items for ${rangeLabel}, including family logistics and health reminders. Great momentum.`;
  }
  if (type === 'upcoming') {
    return `For ${rangeLabel}, your highest priority is afternoon logistics, then bill reminders, followed by pet care tasks.`;
  }
  return `For ${rangeLabel}, you completed morning essentials and still have a manageable afternoon queue. Relay recommends a 20-minute planning block at 1:30 PM.`;
}

export default function SummaryResultScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ range?: string; type?: string; customWindow?: string }>();
  const [talkOpen, setTalkOpen] = useState(false);

  const text = useMemo(() => summaryCopy(params.range ?? 'today', params.type ?? 'both'), [params.range, params.type]);
  const noteTitle = useMemo(() => `Summary · ${params.range ?? 'today'}`, [params.range]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Summary Result" subtitle="Relay overview" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Relay summary" />
          <Text style={styles.summaryText}>{text}</Text>
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Follow-up actions" />
          <ListRow
            icon="chatbubble-ellipses-outline"
            label="Ask follow-up"
            body="Refine this summary by voice"
            onPress={() => setTalkOpen(true)}
          />
          <View style={styles.rowWrap}>
            <ListRow
              icon="document-text-outline"
              label="Save as note"
              body="Store in Notes & Docs"
              onPress={() =>
                router.push({
                  pathname: '/notes/create',
                  params: {
                    title: noteTitle,
                    body: text,
                    source: 'summary',
                  },
                })
              }
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="share-outline"
              label="Share"
              body="Create share-ready recap"
              onPress={() => router.push('/notes/upload?from=summary')}
            />
          </View>
          <ListRow
            icon="swap-horizontal-outline"
            label="Turn into tasks/events"
            body="Route actions to Tasks or Calendar"
            onPress={() => router.push('/home/day-summary')}
          />
        </GlassCard>

        <PrimaryButton label="Done" onPress={() => router.replace('/')} />
        <SecondaryButton label="Reconfigure" onPress={() => router.replace('/home/summary/config')} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  summaryText: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 22,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
  rowWrap: {
    marginTop: ds.spacing.s8,
  },
});
