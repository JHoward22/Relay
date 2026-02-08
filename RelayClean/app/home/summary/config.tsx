import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'custom', label: 'Custom range' },
] as const;

const TYPES = [
  { key: 'upcoming', label: "What's coming up" },
  { key: 'completed', label: "What I've already done" },
  { key: 'both', label: 'Both' },
] as const;

export default function SummaryConfigScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ range?: string; type?: string }>();

  const [range, setRange] = useState<string>(params.range ?? 'today');
  const [type, setType] = useState<string>(params.type ?? 'both');
  const [customWindow, setCustomWindow] = useState('Feb 10 - Feb 14');

  const summaryLabel = useMemo(() => {
    const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? 'Today';
    const typeLabel = TYPES.find((item) => item.key === type)?.label ?? 'Both';
    return `${rangeLabel} · ${typeLabel}`;
  }, [range, type]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Summarize" subtitle="Choose what Relay should analyze" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Time range" />
          <View style={styles.chipRow}>
            {RANGES.map((item) => {
              const selected = range === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setRange(item.key)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {range === 'custom' ? (
            <View style={styles.customWrap}>
              <Text style={styles.customLabel}>Custom range</Text>
              <Pressable style={styles.customInput} onPress={() => setCustomWindow('Feb 11 - Feb 18')}>
                <Text style={styles.customText}>{customWindow}</Text>
              </Pressable>
            </View>
          ) : null}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Summary type" />
          <View style={styles.chipRow}>
            {TYPES.map((item) => {
              const selected = type === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setType(item.key)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.preview}>Preview: {summaryLabel}</Text>
        </GlassCard>

        <PrimaryButton
          label="Generate summary"
          onPress={() =>
            router.push({
              pathname: '/home/summary/result',
              params: { range, type, customWindow },
            })
          }
        />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
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
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  chipActive: {
    borderColor: '#ADC8F8',
    backgroundColor: 'rgba(231, 241, 255, 0.95)',
  },
  chipText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: ds.colors.primary,
  },
  customWrap: {
    marginTop: ds.spacing.s8,
  },
  customLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  customInput: {
    marginTop: ds.spacing.s4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  customText: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
  },
  preview: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
