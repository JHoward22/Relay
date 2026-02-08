import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { useAIMemory } from '../ai-memory-context';

export default function AIInsightDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applyInsight, dismissInsight, getInsight, records, toggleCategory } = useAIMemory();

  const insight = getInsight(id);

  if (!insight) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader title="Insight" onBack={() => router.back()} />
          <GlassCard blur>
            <EmptyState title="Insight unavailable" body="This insight may have been dismissed or expired." />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const sourceRecords = records.filter((record) => insight.sourceMemoryIds.includes(record.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Insight Details" subtitle="Why Relay suggested this" onBack={() => router.back()} />

        <GlassCard blur>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.body}>{insight.body}</Text>
          <Text style={styles.whyLabel}>Why you are seeing this</Text>
          <Text style={styles.body}>{insight.why}</Text>
          <Text style={styles.meta}>Confidence {Math.round(insight.confidence * 100)}%</Text>
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.title}>Source memory</Text>
          {sourceRecords.length ? (
            sourceRecords.map((record) => (
              <View key={record.id} style={styles.sourceRow}>
                <Text style={styles.sourceTitle}>{record.title}</Text>
                <Text style={styles.sourceBody}>{record.detail}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.body}>Relay references active structured memory records tied to this rule.</Text>
          )}
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.title}>Actions</Text>
          <View style={styles.actions}>
            <BubbleChip
              icon="checkmark"
              label="Apply"
              tone="success"
              onPress={() => {
                applyInsight(insight.id);
                router.push(insight.actionRoute);
              }}
            />
            <BubbleChip
              icon="close"
              label="Dismiss"
              tone="neutral"
              onPress={() => {
                dismissInsight(insight.id);
                router.replace('/ai/insights');
              }}
            />
            <BubbleChip
              icon="power-outline"
              label="Disable category"
              tone="danger"
              onPress={() => {
                toggleCategory(insight.category, false);
                router.replace('/ai/memory');
              }}
            />
          </View>
        </GlassCard>
      </ScrollView>
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
  whyLabel: {
    marginTop: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  meta: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  sourceRow: {
    marginTop: ds.spacing.s8,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  sourceTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sourceBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
