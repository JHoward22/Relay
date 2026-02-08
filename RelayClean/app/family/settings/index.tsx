import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { roleLabel, useFamilyStore } from '../family-context';

export default function FamilySettingsScreen() {
  const router = useRouter() as any;
  const { state: relayState, setFamilyMode } = useRelayStore();
  const { state } = useFamilyStore();
  const [disableOpen, setDisableOpen] = useState(false);

  return (
    <FamilyShell title="Family Settings" subtitle="Permissions and shared controls" onBack={() => router.back()}>
      <FamilySectionCard title="Family mode">
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleTitle}>Shared family mode</Text>
            <Text style={styles.toggleBody}>Turn off to hide all shared family surfaces for this account.</Text>
          </View>
          <Switch
            value={relayState.familyModeEnabled}
            onValueChange={(value) => {
              if (!value) {
                setDisableOpen(true);
                return;
              }
              setFamilyMode(true);
            }}
            trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
            thumbColor={relayState.familyModeEnabled ? ds.colors.primary : '#FFFFFF'}
          />
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="Role permissions" rightLabel="Members" onRightPress={() => router.push('/family/members')}>
        {state.members.length ? (
          <View style={styles.listWrap}>
            {state.members.map((member) => (
              <ListRow
                key={member.id}
                icon={member.role === 'child' ? 'happy-outline' : member.role === 'viewer' ? 'eye-outline' : 'person-outline'}
                iconTint={member.color}
                label={member.name}
                body={`${roleLabel(member.role)} · View ${member.permission.view ? 'Yes' : 'No'} · Edit ${member.permission.edit ? 'Yes' : 'No'}`}
                rightText={member.permission.voiceAuthority ? 'Voice' : 'Manual'}
                onPress={() => router.push(`/family/members/${member.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No member permissions" body="Invite members to configure role access." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="System actions">
        <View style={styles.actions}>
          <BubbleChip icon="person-add-outline" label="Invite" tone="primary" onPress={() => router.push('/family/members/invite')} />
          <BubbleChip icon="archive-outline" label="Archive" tone="neutral" onPress={() => router.push('/family/archive')} />
          <BubbleChip icon="shield-checkmark-outline" label="AI guardrails" tone="neutral" onPress={() => router.push('/trust')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Who has admin access right now?'" onAsk={() => router.push('/family/voice-summary')} />

      <SheetModal visible={disableOpen} onClose={() => setDisableOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Disable family mode?</Text>
          <Text style={styles.sheetBody}>Shared surfaces will hide, but data stays available if you re-enable later.</Text>
          <View style={styles.actions}>
            <BubbleChip
              icon="power-outline"
              label="Disable"
              tone="danger"
              onPress={() => {
                setFamilyMode(false);
                setDisableOpen(false);
                router.replace('/family');
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setDisableOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ds.spacing.s12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  toggleBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
