import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function EmailConnectionScreen() {
  const router = useRouter() as any;
  const [connected, setConnected] = useState(false);
  const [drafting, setDrafting] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Email Connection" subtitle="AI drafted follow-ups" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Connection" />
          <ListRow
            variant="compact"
            label="Connected"
            trailing={
              <Switch
                value={connected}
                onValueChange={setConnected}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={connected ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
          <ListRow
            variant="compact"
            label="Allow AI drafting"
            trailing={
              <Switch
                value={drafting}
                onValueChange={setDrafting}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={drafting ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
