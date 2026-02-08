import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { useAIMemory } from '../ai-memory-context';

const FILTERS = ['daily', 'weekly', 'patterns'] as const;
type FilterKey = (typeof FILTERS)[number];

export default function AIInsightsFeedScreen() {
  const router = useRouter() as any;
  const { applyInsight, dismissInsight, insights, restoreInsight, state } = useAIMemory();
  const [filter, setFilter] = useState<FilterKey>('daily');

  const visibleInsights = useMemo(() => {
    if (filter === 'patterns') {
      return insights.filter((item) => item.category === 'behavioral' || item.category === 'temporal');
    }

    if (filter === 'weekly') {
      return insights.filter((item) => item.severity !== 'info');
    }

    return insights;
  }, [filter, insights]);

  const dismissed = state.dismissedInsightIds;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="AI Insights" subtitle="Daily and weekly intelligence feed" onBack={() => router.back()} />

        <GlassCard blur>
          <View style={styles.segmentWrap}>
            {FILTERS.map((key) => {
              const active = key === filter;
              return (
                <Pressable key={key} style={[styles.segment, active ? styles.segmentActive : null]} onPress={() => setFilter(key)}>
                  <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{key[0].toUpperCase() + key.slice(1)}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {visibleInsights.length ? (
          visibleInsights.map((insight) => (
            <GlassCard key={insight.id} blur style={styles.insightCard}>
              <View style={styles.insightHead}>
                <View style={[styles.iconWrap, { backgroundColor: insight.severity === 'medium' ? 'rgba(208,93,93,0.14)' : 'rgba(74,132,241,0.14)' }]}>
                  <Ionicons name={insight.severity === 'medium' ? 'alert-circle-outline' : 'bulb-outline'} size={16} color={insight.severity === 'medium' ? '#D05D5D' : ds.colors.primary} />
                </View>
                <View style={styles.insightTextWrap}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightBody}>{insight.body}</Text>
                </View>
              </View>

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
                <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={() => dismissInsight(insight.id)} />
                <BubbleChip icon="help-circle-outline" label="Why" tone="primary" onPress={() => router.push(`/ai/insights/${insight.id}`)} />
              </View>
            </GlassCard>
          ))
        ) : (
          <GlassCard blur>
            <EmptyState title="No insights in this filter" body="Switch filters or keep using Relay. New insights appear when confidence is high." />
          </GlassCard>
        )}

        {dismissed.length ? (
          <GlassCard blur>
            <Text style={styles.sectionTitle}>Dismissed insights</Text>
            <Text style={styles.sectionBody}>You can restore dismissed insight rules anytime.</Text>
            <View style={styles.actions}>
              {dismissed.slice(0, 6).map((id) => (
                <BubbleChip key={id} icon="arrow-undo-outline" label={id.replace('ins-', '')} tone="neutral" onPress={() => restoreInsight(id)} />
              ))}
            </View>
          </GlassCard>
        ) : null}
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
  segmentWrap: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderColor: 'rgba(80, 152, 255, 0.52)',
    backgroundColor: 'rgba(80, 152, 255, 0.18)',
  },
  segmentText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: ds.colors.primary,
    fontWeight: '700',
  },
  insightCard: {
    gap: ds.spacing.s8,
  },
  insightHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.spacing.s8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  insightBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sectionBody: {
    marginTop: ds.spacing.s4,
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
