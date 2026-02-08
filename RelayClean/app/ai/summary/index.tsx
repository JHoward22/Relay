import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { SummaryRange, SummaryScopeKey, useAIMemory } from '../ai-memory-context';

const RANGES: SummaryRange[] = ['today', 'this-week', 'last-week', 'custom'];
const SCOPES: SummaryScopeKey[] = ['tasks', 'events', 'money', 'meals', 'family', 'pets', 'notes'];

export default function AISummaryComposerScreen() {
  const router = useRouter() as any;
  const { generateSummary } = useAIMemory();

  const [range, setRange] = useState<SummaryRange>('today');
  const [customStartISO, setCustomStartISO] = useState('');
  const [customEndISO, setCustomEndISO] = useState('');
  const [scope, setScope] = useState<SummaryScopeKey[]>(['tasks', 'events', 'family']);

  const toggleScope = (key: SummaryScopeKey) => {
    setScope((prev) => {
      if (prev.includes(key)) return prev.filter((item) => item !== key);
      return [...prev, key];
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Summarize" subtitle="Generate AI summary across memory" onBack={() => router.back()} />

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Time range</Text>
          <View style={styles.chipWrap}>
            {RANGES.map((item) => (
              <BubbleChip
                key={item}
                icon={range === item ? 'checkmark-circle' : 'ellipse-outline'}
                label={item}
                tone={range === item ? 'primary' : 'neutral'}
                onPress={() => setRange(item)}
              />
            ))}
          </View>

          {range === 'custom' ? (
            <View style={styles.customWrap}>
              <FormField label="Start (YYYY-MM-DD)" value={customStartISO} onChangeText={setCustomStartISO} />
              <FormField label="End (YYYY-MM-DD)" value={customEndISO} onChangeText={setCustomEndISO} />
            </View>
          ) : null}
        </GlassCard>

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Include sections</Text>
          <View style={styles.chipWrap}>
            {SCOPES.map((item) => (
              <BubbleChip
                key={item}
                icon={scope.includes(item) ? 'checkmark-circle' : 'ellipse-outline'}
                label={item}
                tone={scope.includes(item) ? 'primary' : 'neutral'}
                onPress={() => toggleScope(item)}
              />
            ))}
          </View>
        </GlassCard>

        <PrimaryButton
          label="Generate summary"
          onPress={() => {
            const summary = generateSummary({
              range,
              customStartISO: range === 'custom' ? customStartISO : undefined,
              customEndISO: range === 'custom' ? customEndISO : undefined,
              scope,
            });
            router.push(`/ai/summary/result?id=${summary.id}`);
          }}
        />

        <Pressable style={styles.linkButton} onPress={() => router.push('/ai/insights')}>
          <Text style={styles.linkText}>Open insights instead</Text>
        </Pressable>
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
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  chipWrap: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  customWrap: {
    marginTop: ds.spacing.s8,
  },
  linkButton: {
    minHeight: 44,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.primary,
    fontWeight: '700',
  },
});
