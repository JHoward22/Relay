import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function MessagesConnectionScreen() {
  const router = useRouter() as any;
  const [enableFuture, setEnableFuture] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Messages Connection" subtitle="Future channel integrations" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Readiness" />
          <Text style={styles.body}>
            Relay will support direct messaging integrations in a future release. You can enable early access signals now.
          </Text>
          <ListRow
            variant="compact"
            label="Enable early access"
            trailing={
              <Switch
                value={enableFuture}
                onValueChange={setEnableFuture}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={enableFuture ? ds.colors.primary : '#FFFFFF'}
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
  body: {
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textSoft,
  },
});
