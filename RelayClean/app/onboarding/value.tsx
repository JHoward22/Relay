import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { ds } from '@/constants/design-system';

const VALUE_ITEMS = [
  'Remembering important things',
  'Managing recurring responsibilities',
  'Reducing mental load',
  'Helping families stay in sync',
];

export default function OnboardingValueScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <View style={styles.content}>
        <GlassCard>
          <SectionTitle title="What Relay helps with" />
          {VALUE_ITEMS.map((item) => (
            <ListRow key={item} icon="checkmark-circle-outline" label={item} variant="compact" />
          ))}
        </GlassCard>

        <PrimaryButton label="Continue" onPress={() => router.push('./preferences')} />
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
});
