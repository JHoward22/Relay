import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { followUpsData } from '../demo-data';

export default function FollowUpsHubScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ action?: string; refresh?: string }>();
  const [talkOpen, setTalkOpen] = useState(false);

  const needsReply = followUpsData.filter((item) => item.status === 'needs-reply');
  const scheduled = followUpsData.filter((item) => item.status === 'scheduled');
  const sent = followUpsData.filter((item) => item.status === 'sent');
  const banner =
    params.action === 'sent'
      ? 'Sent. Relay updated this thread.'
      : params.action === 'scheduled'
        ? 'Scheduled. Relay will surface this tomorrow.'
        : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Follow-Ups"
          subtitle="Keep every commitment visible"
          onBack={() => router.back()}
          rightLabel="Draft"
          onRightPress={() => setTalkOpen(true)}
        />

        {banner ? <Text style={styles.banner}>{banner}</Text> : null}

        <GlassCard blur>
          <SectionHeader title="Needs reply" />
          {needsReply.length ? (
            needsReply.map((item) => (
              <View key={item.id} style={styles.rowWrap}>
                <ListRow
                  icon="mail-unread-outline"
                  label={item.title}
                  body={`${item.contact} · ${item.dueLabel}`}
                  onPress={() => router.push(`/home/follow-ups/${item.id}`)}
                />
              </View>
            ))
          ) : (
            <EmptyState title="No blocked follow-ups" body="Relay will surface anything waiting on a response." />
          )}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Scheduled" />
          {scheduled.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow
                icon="time-outline"
                label={item.title}
                body={`${item.contact} · ${item.dueLabel}`}
                onPress={() => router.push(`/home/follow-ups/${item.id}`)}
              />
            </View>
          ))}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Sent" />
          {sent.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow
                icon="checkmark-circle-outline"
                label={item.title}
                body={`${item.contact} · ${item.dueLabel}`}
                onPress={() => router.push(`/home/follow-ups/${item.id}`)}
              />
            </View>
          ))}
        </GlassCard>

        <PrimaryButton label="Draft a reply" onPress={() => setTalkOpen(true)} />
        <SecondaryButton label="Open life inbox" onPress={() => router.push('/home/inbox')} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
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
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 209, 177, 0.9)',
    backgroundColor: 'rgba(229, 248, 236, 0.9)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.success,
    fontWeight: '600',
  },
});
