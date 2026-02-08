import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';

export default function OnboardingVoiceScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <View style={styles.content}>
        <GlassCard blur style={styles.card}>
          <Text style={styles.title}>The easiest way to use Relay is to just talk.</Text>

          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Ionicons name="mic" size={42} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.body}>You can always edit or confirm before anything is saved.</Text>
        </GlassCard>

        <View style={styles.footer}>
          <SecondaryButton label="Try it later" onPress={() => router.push('./complete')} />
          <PrimaryButton label="I’m ready" onPress={() => router.push('./complete')} />
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
  card: {
    gap: ds.spacing.s16,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
  },
  iconWrap: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.colors.primary,
    ...ds.shadow.card,
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
