import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { FamilySectionCard, FamilyShell, FamilyTalkSheet, FamilyVoiceHint } from './components/FamilyShell';
import { useFamilyStore } from './family-context';

export default function FamilyHubHomeScreen() {
  const router = useRouter() as any;
  const { state: relayState, setFamilyMode } = useRelayStore();
  const { state, alerts, dismissAlert } = useFamilyStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const sharedTasks = state.tasks.filter((item) => item.status === 'open' && !item.archived).length;
  const sharedEvents = state.events.filter((item) => item.dateISO >= new Date().toISOString().slice(0, 10)).length;

  const topAlerts = alerts.slice(0, 1);

  const membersSummary = useMemo(
    () => state.members.slice(0, 3).map((member) => member.name).join(' · '),
    [state.members]
  );

  if (!relayState.familyModeEnabled) {
    return (
      <FamilyShell title="Family Hub" subtitle="Optional for shared households">
        <GlassCard blur>
          <EmptyState
            title="Family mode is off"
            body="Turn it on when you want shared schedules, assignments, and household coordination."
          />
          <View style={styles.emptyActions}>
            <PrimaryButton
              label="Create Family"
              onPress={() => {
                setFamilyMode(true);
                router.push('/family/setup');
              }}
            />
            <SecondaryButton label="Back to Home" onPress={() => router.push('/')} />
          </View>
        </GlassCard>

        <FamilyVoiceHint label="Try saying: set up a shared family plan" onAsk={() => setTalkOpen(true)} />
        <FamilyTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell
      title={state.family?.name ?? 'Family Hub'}
      subtitle={`${sharedTasks} tasks due today`}
      headerActions={[
        { icon: 'person-add-outline', label: 'Invite', onPress: () => router.push('/family/members/invite') },
        { icon: 'mic-outline', label: 'Ask', onPress: () => setTalkOpen(true) },
      ]}
    >
      <FamilySectionCard title="Coordinate Today" rightLabel="Calendar" onRightPress={() => router.push('/family/calendar')}>
        <View style={styles.statusRow}>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>Open tasks</Text>
            <Text style={styles.statusValue}>{sharedTasks}</Text>
          </View>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>Upcoming events</Text>
            <Text style={styles.statusValue}>{sharedEvents}</Text>
          </View>
          <View style={styles.statusCell}>
            <Text style={styles.statusLabel}>Members</Text>
            <Text style={styles.statusValue}>{state.members.length}</Text>
          </View>
        </View>

        <View style={styles.primaryActions}>
          <PrimaryButton label="Shared Tasks" onPress={() => router.push('/family/tasks')} style={styles.flex} />
          <SecondaryButton label="Family Calendar" onPress={() => router.push('/family/calendar')} style={styles.flex} />
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="People & Assignments" rightLabel="Members" onRightPress={() => router.push('/family/members')}>
        <View style={styles.listWrap}>
          <ListRow
            icon="people-outline"
            label="Members"
            body={membersSummary || 'No members yet'}
            onPress={() => router.push('/family/members')}
          />
          <ListRow
            icon="happy-outline"
            label="Kids"
            body={state.children.length ? `${state.children.length} child profiles` : 'Add child details'}
            onPress={() => router.push('/family/kids')}
          />
          <ListRow
            icon="checkbox-outline"
            label="Assignment history"
            body="See completion and responsibility patterns"
            onPress={() => router.push('/family/archive')}
          />
        </View>
      </FamilySectionCard>

      {topAlerts.map((alert) => (
        <GlassCard key={alert.id} blur>
          <Text style={styles.alertEyebrow}>Top Insight</Text>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertBody}>{alert.body}</Text>
          <View style={styles.chipsRow}>
            <BubbleChip icon="open-outline" label="Open" tone="success" onPress={() => router.push(alert.route)} />
            <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={() => dismissAlert(alert.id)} />
          </View>
        </GlassCard>
      ))}

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.chipsRow}>
          <BubbleChip icon="cart-outline" label="Shopping" tone="neutral" onPress={() => router.push('/family/shopping')} />
          <BubbleChip icon="document-text-outline" label="Documents" tone="neutral" onPress={() => router.push('/family/documents')} />
          <BubbleChip icon="paw-outline" label="Pets" tone="neutral" onPress={() => router.push('/pets')} />
          <BubbleChip icon="settings-outline" label="Settings" tone="neutral" onPress={() => router.push('/family/settings')} />
        </View>
      </GlassCard>

      <FamilyVoiceHint
        label="Try saying: assign dishes to Alex tonight"
        onAsk={() => router.push('/family/voice-summary')}
      />

      <FamilyTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  emptyActions: {
    marginTop: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  statusCell: {
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  statusLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  statusValue: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 22,
    lineHeight: 26,
    color: ds.colors.text,
    fontWeight: '700',
  },
  primaryActions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
  alertEyebrow: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  alertTitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 21,
    color: ds.colors.text,
    fontWeight: '700',
  },
  alertBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
