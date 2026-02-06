import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BottomMicBar } from '@/components/relay/BottomMicBar';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function SettingsScreen() {
  const router = useRouter() as any;
  const [relayOpen, setRelayOpen] = useState(false);
  const { state, updateAISettings, markInboxDone, snoozeInbox } = useRelayStore();
  const firstOpen = state.inbox.find((item) => !item.done);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Settings" subtitle="Control and transparency" />

        <GlassCard>
          <Text style={styles.profileName}>Jaiden Howard</Text>
          <Text style={styles.profileSub}>Relay Free plan · Personal workspace</Text>
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Plan & Billing" />
          <ListRow
            variant="compact"
            label="Upgrade to Relay Pro"
            body="Compare Free, Pro, and Family plans"
            onPress={() => router.push('/pro')}
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Family Hub" />
          <ListRow
            variant="compact"
            label="Family overview"
            body="Members, assignments, and shared responsibilities"
            onPress={() => router.push('/settings/family')}
          />
          <ListRow
            variant="compact"
            label="Assignment history"
            body="See what was completed and when"
            onPress={() => router.push('/settings/family/assignments')}
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="App Connections" />
          <ListRow
            variant="compact"
            label="Calendar connection"
            body="Sync calendar events and reminders"
            onPress={() => router.push('/settings/notifications')}
          />
          <ListRow
            variant="compact"
            label="Mail connection"
            body="Track message follow-ups inside Relay"
            onPress={() => router.push('/settings/notifications')}
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Notifications" />
          <ListRow
            variant="compact"
            label="Nudges and quiet hours"
            body="Customize recap and reminder timing"
            onPress={() => router.push('/settings/notifications')}
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Privacy & AI" />
          <ListRow
            variant="compact"
            label="How Relay uses AI"
            body="Plain-language guardrails and controls"
            onPress={() => router.push('/trust')}
          />
          <ListRow
            variant="compact"
            label="Smart suggestions"
            trailing={
              <Switch
                value={state.aiSettings.smartSuggestions}
                onValueChange={(value) => updateAISettings({ smartSuggestions: value })}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={state.aiSettings.smartSuggestions ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
          <ListRow
            variant="compact"
            label="Learning from activity"
            trailing={
              <Switch
                value={state.aiSettings.learningFromActivity}
                onValueChange={(value) => updateAISettings({ learningFromActivity: value })}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={state.aiSettings.learningFromActivity ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
          <ListRow
            variant="compact"
            label="Proactive reminders"
            trailing={
              <Switch
                value={state.aiSettings.proactiveReminders}
                onValueChange={(value) => updateAISettings({ proactiveReminders: value })}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={state.aiSettings.proactiveReminders ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Help & Support" />
          <ListRow
            variant="compact"
            label="Help center"
            body="FAQ, support, and app guidance"
            onPress={() => router.push('/modal')}
          />
        </GlassCard>

        <Text style={styles.footerHint}>Relay is your assistant, not your boss. You stay in control.</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomMicBar
        onMicPress={() => setRelayOpen(true)}
        onDone={() => {
          if (firstOpen) markInboxDone(firstOpen.id);
        }}
        onLater={() => {
          if (firstOpen) snoozeInbox(firstOpen.id);
        }}
        onViewAll={() => router.push('/home/inbox')}
      />

      <TalkToRelaySheet visible={relayOpen} onClose={() => setRelayOpen(false)} />
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
    paddingBottom: 270,
    gap: ds.spacing.s12,
  },
  profileName: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
  },
  profileSub: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  footerHint: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: ds.spacing.s16,
  },
});
