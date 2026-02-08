import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { updateFollowUpRecord } from '../demo-data';

export default function FollowUpConfirmScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ mode?: string; id?: string; draft?: string }>();
  const mode = params.mode ?? 'send';
  const id = params.id;

  const onConfirm = () => {
    if (id) {
      updateFollowUpRecord(id, {
        status: mode === 'later' ? 'scheduled' : 'sent',
        dueLabel: mode === 'later' ? 'Follow up tomorrow morning' : 'Sent just now',
        aiDraft: params.draft,
      });
    }

    router.replace({
      pathname: '/home/follow-ups',
      params: {
        action: mode === 'later' ? 'scheduled' : 'sent',
        refresh: String(Date.now()),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Confirm Follow-Up" subtitle="Relay understood:" onBack={() => router.back()} />

        <GlassCard blur>
          <View style={styles.row}>
            <Text style={styles.bullet}>•</Text>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{mode === 'later' ? 'Schedule this follow-up for later' : 'Send this follow-up now'}</Text>
              <Text style={styles.meta}>{mode === 'later' ? 'Snooze to tomorrow morning' : 'Mark thread as sent'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.bullet}>•</Text>
            <View style={styles.textWrap}>
              <Text style={styles.title}>Draft</Text>
              <Text style={styles.meta}>{params.draft ?? 'No draft provided'}</Text>
            </View>
          </View>
        </GlassCard>

        <PrimaryButton label="Confirm" onPress={onConfirm} />
        <SecondaryButton label="Edit" onPress={() => router.back()} />
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  bullet: {
    marginTop: 1,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  meta: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
