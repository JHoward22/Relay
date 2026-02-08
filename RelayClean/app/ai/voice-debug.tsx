import { useRouter } from 'expo-router';
import React, { useSyncExternalStore } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import {
  clearVoiceDebugEntries,
  getVoiceDebugEntries,
  isVoiceDebugEnabled,
  setVoiceDebugEnabled,
  subscribeVoiceDebug,
} from '@/store/voice-router';

export default function VoiceDebugScreen() {
  const router = useRouter() as any;

  const enabled = useSyncExternalStore(
    subscribeVoiceDebug,
    isVoiceDebugEnabled,
    isVoiceDebugEnabled
  );
  const entries = useSyncExternalStore(
    subscribeVoiceDebug,
    getVoiceDebugEntries,
    getVoiceDebugEntries
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Voice Debug"
          subtitle="Transcript, intent, slots, and routing decisions"
          onBack={() => router.back()}
        />

        <GlassCard blur>
          <Text style={styles.sectionTitle}>Developer Controls</Text>
          <View style={styles.chips}>
            <BubbleChip
              icon={enabled ? 'eye-off-outline' : 'eye-outline'}
              label={enabled ? 'Disable debug' : 'Enable debug'}
              tone="primary"
              onPress={() => setVoiceDebugEnabled(!enabled)}
            />
            <BubbleChip
              icon="trash-outline"
              label="Clear log"
              tone="neutral"
              onPress={clearVoiceDebugEntries}
            />
          </View>
          <Text style={styles.helper}>
            Hidden mode for QA: keeps the last 120 voice routing events.
          </Text>
        </GlassCard>

        {entries.length ? (
          entries.map((entry) => (
            <GlassCard key={entry.id} blur style={styles.entryCard}>
              <Text style={styles.timestamp}>{new Date(entry.atISO).toLocaleString()}</Text>
              <Text style={styles.transcript}>{`\u201c${entry.transcript}\u201d`}</Text>
              <Text style={styles.meta}>Intent: {entry.intent}</Text>
              <Text style={styles.meta}>Confidence: {Math.round(entry.confidence * 100)}%</Text>
              <Text style={styles.meta}>Handler: {entry.handler}</Text>
              <Text style={styles.meta}>Context: {entry.contextTab} ({entry.contextPath})</Text>
              <Text style={styles.meta}>Confirmation: {entry.confirmationRequired ? 'Required' : 'No'}</Text>
              <Text style={styles.meta}>Missing slots: {entry.missingSlots.join(', ') || 'None'}</Text>
              <Text style={styles.meta}>Slots: {Object.keys(entry.slots).length ? JSON.stringify(entry.slots) : '{}'}</Text>
              <Text style={styles.reasoning}>{entry.reasoning}</Text>
            </GlassCard>
          ))
        ) : (
          <GlassCard blur>
            <Text style={styles.helper}>No voice debug entries yet. Trigger Talk to Relay to populate this log.</Text>
          </GlassCard>
        )}
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
  chips: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  helper: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  entryCard: {
    gap: ds.spacing.s4,
  },
  timestamp: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  transcript: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  meta: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  reasoning: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.text,
    fontWeight: '600',
  },
});
