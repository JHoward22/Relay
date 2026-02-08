import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { roleLabel, useFamilyStore } from '../family-context';

export default function FamilyMembersScreen() {
  const router = useRouter() as any;
  const { state } = useFamilyStore();

  return (
    <FamilyShell
      title="Members"
      subtitle={`${state.members.length} active profiles`}
      onBack={() => router.back()}
      headerActions={[{ icon: 'person-add-outline', label: 'Invite', onPress: () => router.push('/family/members/invite') }]}
    >
      <FamilySectionCard title="Roles" rightLabel="Permissions" onRightPress={() => router.push('/family/settings')}>
        {state.members.length ? (
          <View style={styles.rows}>
            {state.members.map((member) => (
              <ListRow
                key={member.id}
                icon={member.role === 'viewer' ? 'eye-outline' : member.role === 'child' ? 'happy-outline' : 'person-outline'}
                iconTint={member.color}
                label={member.name}
                body={`${roleLabel(member.role)} · ${member.email ?? 'In-house member'}`}
                badge={member.permission.edit ? 'Can edit' : 'View only'}
                onPress={() => router.push(`/family/members/${member.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No members yet" body="Invite your first household member to share schedules and tasks." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Invite Flow">
        <Text style={styles.copy}>Send a demo invite link, assign role access, and preview permission boundaries before confirming.</Text>
        <View style={styles.actions}>
          <BubbleChip icon="mail-outline" label="Invite by email" tone="primary" onPress={() => router.push('/family/members/invite')} />
          <BubbleChip icon="link-outline" label="Copy link" tone="neutral" onPress={() => router.push('/family/members/invite?mode=link')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint
        label="Try saying: 'Invite Sam as an adult with edit rights.'"
        onAsk={() => router.push('/family/voice-summary')}
      />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: ds.spacing.s8,
  },
  copy: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
