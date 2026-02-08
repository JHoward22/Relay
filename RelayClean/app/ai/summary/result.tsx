import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { useAIMemory } from '../ai-memory-context';

export default function AISummaryResultScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSummary, answerVoiceMemoryQuery } = useAIMemory();

  const summary = getSummary(id);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceQuery] = useState('Why did you suggest this?');

  const voiceResponse = useMemo(() => answerVoiceMemoryQuery(voiceQuery), [answerVoiceMemoryQuery, voiceQuery]);

  if (!summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader title="Summary" onBack={() => router.back()} />
          <GlassCard blur>
            <EmptyState title="Summary not found" body="Generate a new summary from the composer." />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Summary Result" subtitle={summary.rangeLabel} onBack={() => router.back()} />

        <GlassCard blur>
          <Text style={styles.title}>{summary.title}</Text>
          {summary.lines.map((line) => (
            <Text key={line} style={styles.body}>• {line}</Text>
          ))}
          <Text style={styles.source}>{summary.sourceSummary}</Text>
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.title}>Metrics</Text>
          <View style={styles.metricsWrap}>
            {summary.metrics.map((metric) => (
              <View key={metric.label} style={styles.metricCell}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.title}>Actions</Text>
          <View style={styles.actions}>
            <BubbleChip icon="volume-high-outline" label="Voice readout" tone="primary" onPress={() => setVoiceOpen(true)} />
            <BubbleChip icon="document-text-outline" label="Convert to note" tone="success" onPress={() => router.push('/notes/create')} />
            <BubbleChip icon="share-outline" label="Share" tone="neutral" onPress={() => setVoiceOpen(true)} />
            <BubbleChip icon="help-circle-outline" label="Follow-up" tone="neutral" onPress={() => router.push('/ai/insights')} />
          </View>
        </GlassCard>
      </ScrollView>

      <SheetModal visible={voiceOpen} onClose={() => setVoiceOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Relay follow-up</Text>
          <Text style={styles.sheetBody}>{voiceResponse.answer}</Text>
          <Text style={styles.sheetMeta}>Sources: {voiceResponse.sources.join(' · ')}</Text>
          <View style={styles.actions}>
            <BubbleChip icon="checkmark" label="Done" tone="success" onPress={() => setVoiceOpen(false)} />
            <BubbleChip icon="create-outline" label="More insights" tone="neutral" onPress={() => { setVoiceOpen(false); router.push('/ai/insights'); }} />
          </View>
        </View>
      </SheetModal>
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
    paddingBottom: ds.spacing.s32 + 82,
    gap: ds.spacing.s12,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  source: {
    marginTop: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  metricsWrap: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  metricCell: {
    minWidth: '46%',
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  metricLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  metricValue: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetMeta: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '600',
  },
});
