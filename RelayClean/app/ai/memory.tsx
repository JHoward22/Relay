import { useRouter } from 'expo-router';
import React, { useMemo, useSyncExternalStore, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import {
  isVoiceDebugEnabled,
  subscribeVoiceDebug,
  toggleVoiceDebugEnabled,
} from '@/store/voice-router';
import { useAIMemory } from './ai-memory-context';

const CATEGORY_LABELS = {
  preference: 'Preference memory',
  behavioral: 'Behavioral memory',
  temporal: 'Temporal memory',
  relational: 'Relational memory',
  contextual: 'Contextual memory',
} as const;

export default function AIMemoryDashboardScreen() {
  const router = useRouter() as any;
  const {
    state,
    records,
    clearCategory,
    resetAllMemory,
    toggleCategory,
    toggleLearning,
    toggleProactive,
  } = useAIMemory();

  const debugEnabled = useSyncExternalStore(
    subscribeVoiceDebug,
    isVoiceDebugEnabled,
    isVoiceDebugEnabled
  );

  const [clearTarget, setClearTarget] = useState<
    keyof typeof CATEGORY_LABELS | null
  >(null);
  const [resetOpen, setResetOpen] = useState(false);

  const recentPatterns = useMemo(() => records.slice(0, 8), [records]);
  const preferenceRecords = useMemo(
    () => records.filter((record) => record.category === 'preference').slice(0, 4),
    [records]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="AI Memory"
          subtitle="Transparent learning and controls"
          onBack={() => router.back()}
        />

        <GlassCard blur>
          <Text style={styles.sectionTitle}>What Relay remembers</Text>
          {Object.keys(CATEGORY_LABELS).map((raw) => {
            const key = raw as keyof typeof CATEGORY_LABELS;
            return (
              <View key={key} style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleTitle}>{CATEGORY_LABELS[key]}</Text>
                  <Text style={styles.toggleBody}>
                    Structured app signals only. Never hidden learning.
                  </Text>
                </View>
                <Switch
                  value={state.controls.categories[key]}
                  onValueChange={(value) => toggleCategory(key, value)}
                  trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                  thumbColor={
                    state.controls.categories[key] ? ds.colors.primary : '#FFFFFF'
                  }
                />
              </View>
            );
          })}
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Suggestions engine status</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Learning from activity</Text>
              <Text style={styles.toggleBody}>
                When off, Relay stops updating memory from new events.
              </Text>
            </View>
            <Switch
              value={state.controls.learningEnabled}
              onValueChange={toggleLearning}
              trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
              thumbColor={state.controls.learningEnabled ? ds.colors.primary : '#FFFFFF'}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>Proactive insights</Text>
              <Text style={styles.toggleBody}>
                Allow Relay to surface high-confidence suggestions.
              </Text>
            </View>
            <Switch
              value={state.controls.proactiveEnabled}
              onValueChange={toggleProactive}
              trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
              thumbColor={state.controls.proactiveEnabled ? ds.colors.primary : '#FFFFFF'}
            />
          </View>
          <View style={styles.engineActions}>
            <BubbleChip
              icon="bulb-outline"
              label="Insights feed"
              tone="primary"
              onPress={() => router.push('/ai/insights')}
            />
            <BubbleChip
              icon="document-text-outline"
              label="Generate summary"
              tone="neutral"
              onPress={() => router.push('/ai/summary')}
            />
          </View>
        </GlassCard>

        <GlassCard blur>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent learned patterns</Text>
            <Pressable onPress={() => router.push('/ai/insights')}>
              <Text style={styles.link}>View insights</Text>
            </Pressable>
          </View>
          {recentPatterns.length ? (
            recentPatterns.map((record) => (
              <View key={record.id} style={styles.patternRow}>
                <Text style={styles.patternTitle}>{record.title}</Text>
                <Text style={styles.patternBody}>{record.detail}</Text>
                <Text style={styles.patternMeta}>
                  Confidence {Math.round(record.confidence * 100)}%
                </Text>
              </View>
            ))
          ) : (
            <EmptyState
              title="No learned patterns yet"
              body="Use Relay across tabs and memory patterns will appear here."
            />
          )}
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Preferences inferred</Text>
          {preferenceRecords.length ? (
            <View style={styles.chipWrap}>
              {preferenceRecords.map((item) => (
                <BubbleChip
                  key={item.id}
                  icon="sparkles-outline"
                  label={item.title}
                  tone="neutral"
                  onPress={() => router.push('/ai/insights')}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No inferred preferences"
              body="Relay will infer preferences after more usage."
            />
          )}
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Privacy controls</Text>
          <Text style={styles.privacyBody}>
            Relay only uses data you add in-app. You can clear any memory category,
            disable learning, or reset everything at any time.
          </Text>
          <Pressable
            onLongPress={toggleVoiceDebugEnabled}
            delayLongPress={520}
            style={styles.devTrigger}
          >
            <Text style={styles.devText}>Developer controls</Text>
          </Pressable>
          <View style={styles.engineActions}>
            {Object.keys(CATEGORY_LABELS).map((raw) => {
              const key = raw as keyof typeof CATEGORY_LABELS;
              return (
                <BubbleChip
                  key={key}
                  icon="trash-outline"
                  label={`Clear ${CATEGORY_LABELS[key].replace(' memory', '')}`}
                  tone="neutral"
                  onPress={() => setClearTarget(key)}
                />
              );
            })}
            <BubbleChip
              icon="refresh-outline"
              label="Reset all memory"
              tone="danger"
              onPress={() => setResetOpen(true)}
            />
            {debugEnabled ? (
              <BubbleChip
                icon="terminal-outline"
                label="Voice debug"
                tone="primary"
                onPress={() => router.push('/ai/voice-debug')}
              />
            ) : null}
          </View>
        </GlassCard>
      </ScrollView>

      <SheetModal visible={!!clearTarget} onClose={() => setClearTarget(null)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Clear category memory?</Text>
          <Text style={styles.sheetBody}>
            {clearTarget ? CATEGORY_LABELS[clearTarget] : ''} will be removed from
            current memory records.
          </Text>
          <View style={styles.engineActions}>
            <BubbleChip
              icon="trash-outline"
              label="Clear"
              tone="danger"
              onPress={() => {
                if (!clearTarget) return;
                clearCategory(clearTarget);
                setClearTarget(null);
              }}
            />
            <BubbleChip
              icon="close"
              label="Cancel"
              tone="neutral"
              onPress={() => setClearTarget(null)}
            />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={resetOpen} onClose={() => setResetOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Reset all memory?</Text>
          <Text style={styles.sheetBody}>
            This clears learned patterns, insights, and summaries in this demo
            session.
          </Text>
          <View style={styles.engineActions}>
            <BubbleChip
              icon="refresh-outline"
              label="Reset"
              tone="danger"
              onPress={() => {
                resetAllMemory();
                setResetOpen(false);
              }}
            />
            <BubbleChip
              icon="close"
              label="Cancel"
              tone="neutral"
              onPress={() => setResetOpen(false)}
            />
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
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  link: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  toggleRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ds.spacing.s12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  toggleBody: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  engineActions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  patternRow: {
    marginTop: ds.spacing.s8,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  patternTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  patternBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  patternMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  chipWrap: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  privacyBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  devTrigger: {
    marginTop: ds.spacing.s8,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 1,
  },
  devText: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 15,
    color: ds.colors.textMuted,
    opacity: 0.32,
    fontWeight: '600',
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
});
