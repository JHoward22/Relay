import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

export default function OnboardingCompleteScreen() {
  const router = useRouter() as any;
  const { completeOnboarding } = useOnboardingSession();

  const handleGoHome = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <View style={styles.content}>
        <GlassCard blur>
          <Text style={styles.title}>Relay is ready when you are.</Text>
          <Text style={styles.subtitle}>You can adjust preferences anytime in Settings.</Text>
        </GlassCard>

        <PrimaryButton label="Go to Home" onPress={handleGoHome} />
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
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.title.fontSize,
    lineHeight: ds.type.title.lineHeight,
    letterSpacing: -0.2,
    fontWeight: '600',
    color: ds.colors.text,
  },
  subtitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '400',
    color: ds.colors.textMuted,
  },
});
