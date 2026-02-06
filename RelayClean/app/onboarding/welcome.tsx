import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

export default function OnboardingWelcomeScreen() {
  const router = useRouter() as any;
  const { completeOnboarding } = useOnboardingSession();

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <GlassCard blur style={styles.heroCard}>
          <Text style={styles.brand}>Relay</Text>
          <Text style={styles.tagline}>Your AI-powered life assistant</Text>
          <Text style={styles.body}>Organize tasks, reminders, and follow-ups in one calm daily hub.</Text>
        </GlassCard>

        <View style={styles.footer}>
          <PrimaryButton label="Get started" onPress={() => router.push('./value')} />
          <SecondaryButton label="Skip for now" onPress={handleSkip} />
        </View>
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
    gap: ds.spacing.s24,
  },
  heroCard: {
    gap: ds.spacing.s12,
  },
  brand: {
    fontFamily: ds.font,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.3,
    fontWeight: '600',
    color: ds.colors.text,
  },
  tagline: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: ds.colors.text,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '400',
    color: ds.colors.textMuted,
  },
  footer: {
    gap: ds.spacing.s12,
  },
});
