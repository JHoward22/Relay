import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { MemberRole, roleLabel, useFamilyStore } from '../../family-context';

const ROLE_ORDER: MemberRole[] = ['admin', 'adult', 'child', 'viewer'];

export default function MemberDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateMemberRole, removeMember } = useFamilyStore();

  const member = useMemo(() => state.members.find((item) => item.id === id), [id, state.members]);
  const memberTasks = useMemo(
    () => state.tasks.filter((task) => task.assignedMemberIds.includes(id) && !task.archived),
    [id, state.tasks]
  );

  const [pendingRole, setPendingRole] = useState<MemberRole | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);

  if (!member) {
    return (
      <FamilyShell title="Member" onBack={() => router.back()}>
        <EmptyState title="Member not found" body="This profile no longer exists." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={member.name} subtitle={`${roleLabel(member.role)} permissions`} onBack={() => router.back()}>
      <FamilySectionCard title="Role">
        <View style={styles.roleRow}>
          {ROLE_ORDER.map((item) => (
            <BubbleChip
              key={item}
              icon={item === member.role ? 'checkmark-circle' : 'ellipse-outline'}
              label={roleLabel(item)}
              tone={item === member.role ? 'primary' : 'neutral'}
              onPress={() => {
                if (item !== member.role) setPendingRole(item);
              }}
            />
          ))}
        </View>
        <Text style={styles.permissionCopy}>
          {member.permission.edit ? 'Can edit shared plans' : 'Read-only access'} · {member.permission.destructive ? 'Can remove members' : 'No destructive access'}
        </Text>
      </FamilySectionCard>

      <FamilySectionCard title="Current assignments" rightLabel="Assign task" onRightPress={() => router.push(`/family/tasks/create?memberId=${member.id}`)}>
        {memberTasks.length ? (
          <View style={styles.listWrap}>
            {memberTasks.map((task) => (
              <ListRow
                key={task.id}
                icon="checkbox-outline"
                iconTint={member.color}
                label={task.title}
                body={`${task.dueDateISO}${task.recurringRule ? ` · ${task.recurringRule}` : ''}`}
                rightText={task.status === 'done' ? 'Done' : 'Open'}
                onPress={() => router.push(`/family/tasks/${task.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No assignments" body="Assign the first shared task to this member." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Assign task" tone="primary" onPress={() => router.push(`/family/tasks/create?memberId=${member.id}`)} />
          <BubbleChip icon="calendar-outline" label="Add event" tone="primary" onPress={() => router.push(`/family/calendar/create?memberId=${member.id}`)} />
          <BubbleChip icon="trash-outline" label="Remove member" tone="danger" onPress={() => setRemoveOpen(true)} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Reassign dishes from Alex to me.'" onAsk={() => router.push('/family/voice-summary')} />

      <SheetModal visible={!!pendingRole} onClose={() => setPendingRole(null)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Confirm role change</Text>
          <Text style={styles.sheetBody}>Change {member.name} to {pendingRole ? roleLabel(pendingRole) : ''}?</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Confirm"
              tone="success"
              onPress={() => {
                if (!pendingRole) return;
                updateMemberRole(member.id, pendingRole);
                setPendingRole(null);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setPendingRole(null)} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={removeOpen} onClose={() => setRemoveOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Remove member?</Text>
          <Text style={styles.sheetBody}>This will unassign open tasks and revoke shared edit access.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="trash-outline"
              label="Remove"
              tone="danger"
              onPress={() => {
                removeMember(member.id);
                setRemoveOpen(false);
                router.replace('/family/members');
              }}
            />
            <BubbleChip icon="arrow-back" label="Keep" tone="neutral" onPress={() => setRemoveOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  permissionCopy: {
    marginTop: ds.spacing.s8,
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
  sheetActions: {
    marginTop: ds.spacing.s16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
