import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { ds } from '@/constants/design-system';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

const DOMAIN_OPTIONS = ['Health', 'Family', 'Work', 'Personal'];

export default function OnboardingPreferencesScreen() {
  const router = useRouter() as any;
  const { preferences, setGuidance, toggleDomain } = useOnboardingSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <View style={styles.content}>
        <GlassCard>
          <SectionTitle title="What should Relay help you manage?" />
          <View style={styles.optionWrap}>
            {DOMAIN_OPTIONS.map((option) => {
              const selected = preferences.domains.includes(option);
              return (
                <Pressable
                  key={option}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleDomain(option)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Reminder style" />
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeCard, preferences.guidance === 'gentle' && styles.modeCardSelected]}
              onPress={() => setGuidance('gentle')}
            >
              <Text style={[styles.modeTitle, preferences.guidance === 'gentle' && styles.modeTitleSelected]}>
                Gentle
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modeCard, preferences.guidance === 'proactive' && styles.modeCardSelected]}
              onPress={() => setGuidance('proactive')}
            >
              <Text style={[styles.modeTitle, preferences.guidance === 'proactive' && styles.modeTitleSelected]}>
                Proactive
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        <PrimaryButton label="Continue" onPress={() => router.push('./voice')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s24,
    paddingBottom: ds.spacing.s24,
    gap: ds.spacing.s12,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  chip: {
    borderRadius: ds.radius.pill,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    backgroundColor: ds.colors.cardSoft,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  chipSelected: {
    backgroundColor: ds.colors.primary,
    borderColor: ds.colors.primary,
  },
  chipText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textSoft,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  modeRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  modeCard: {
    flex: 1,
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: ds.colors.bgAlt,
    paddingVertical: ds.spacing.s16,
    alignItems: 'center',
  },
  modeCardSelected: {
    borderColor: ds.colors.primary,
    backgroundColor: ds.colors.primarySoft,
  },
  modeTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textSoft,
    fontWeight: '600',
  },
  modeTitleSelected: {
    color: ds.colors.primary,
  },
});
