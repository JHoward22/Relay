import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { FormField } from '@/components/relay/FormField';
import { EmptyState } from '@/components/relay/EmptyState';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function FamilyTaskDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, state, toggleTask, updateTask, addTaskComment } = useFamilyStore();

  const task = getTask(id);
  const [comment, setComment] = useState('');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [nextMemberId, setNextMemberId] = useState<string | null>(null);

  const assigneeNames = useMemo(() => {
    if (!task) return '';
    return task.assignedMemberIds
      .map((memberId) => state.members.find((member) => member.id === memberId)?.name)
      .filter(Boolean)
      .join(', ');
  }, [state.members, task]);

  if (!task) {
    return (
      <FamilyShell title="Task" onBack={() => router.back()}>
        <EmptyState title="Task not found" body="This task may have been removed." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={task.title} subtitle={`${task.status === 'done' ? 'Completed' : 'Open'} · ${task.dueDateISO}`} onBack={() => router.back()}>
      <FamilySectionCard title="Task overview">
        <Text style={styles.body}>Assigned to: {assigneeNames || 'Unassigned'}</Text>
        <Text style={styles.body}>Recurring: {task.recurringRule ?? 'No'}</Text>
      </FamilySectionCard>

      <FamilySectionCard title="Comments">
        {task.comments.length ? (
          <View style={styles.commentList}>
            {task.comments.map((entry) => {
              const author = state.members.find((member) => member.id === entry.byMemberId)?.name || 'Member';
              return (
                <View key={entry.id} style={styles.commentCard}>
                  <Text style={styles.commentText}>{entry.text}</Text>
                  <Text style={styles.commentMeta}>{author} · {new Date(entry.createdAtISO).toLocaleDateString()}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No comments yet.</Text>
        )}

        <FormField label="Add comment" value={comment} onChangeText={setComment} placeholder="Add context for this task" />
        <View style={styles.actions}>
          <BubbleChip
            icon="send-outline"
            label="Post"
            tone="primary"
            onPress={() => {
              if (!comment.trim()) return;
              addTaskComment(task.id, {
                byMemberId: state.members[0]?.id ?? task.createdByMemberId,
                text: comment.trim(),
              });
              setComment('');
            }}
          />
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.primaryActions}>
          <PrimaryButton
            label={task.status === 'done' ? 'Reopen' : 'Mark done'}
            onPress={() => toggleTask(task.id)}
            style={styles.flex}
          />
          <SecondaryButton label="Reassign" onPress={() => setReassignOpen(true)} style={styles.flex} />
        </View>
      </FamilySectionCard>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.actions}>
          <BubbleChip
            icon="repeat-outline"
            label={task.recurringRule ? 'Clear recurring' : 'Set recurring'}
            tone="neutral"
            onPress={() => updateTask(task.id, { recurringRule: task.recurringRule ? undefined : 'Weekly' })}
          />
          <BubbleChip icon="archive-outline" label={task.archived ? 'Restore' : 'Archive'} tone="neutral" onPress={() => updateTask(task.id, { archived: !task.archived })} />
          <BubbleChip icon="mic-outline" label="Ask Relay" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
        </View>
      </GlassCard>

      <FamilyVoiceHint label="Try saying: 'Reassign this to Michael and move it to tomorrow.'" onAsk={() => router.push('/family/voice-summary')} />

      <SheetModal visible={reassignOpen} onClose={() => setReassignOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Reassign task</Text>
          <Text style={styles.sheetBody}>Select a member, then confirm to update assignment.</Text>

          <View style={styles.memberList}>
            {state.members.map((member) => (
              <BubbleChip
                key={member.id}
                icon={nextMemberId === member.id ? 'checkmark-circle' : 'person-outline'}
                label={member.name}
                tone={nextMemberId === member.id ? 'primary' : 'neutral'}
                onPress={() => setNextMemberId(member.id)}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <BubbleChip
              icon="checkmark"
              label="Confirm"
              tone="success"
              onPress={() => {
                if (!nextMemberId) return;
                updateTask(task.id, { assignedMemberIds: [nextMemberId] });
                setReassignOpen(false);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setReassignOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
    marginBottom: ds.spacing.s4,
  },
  commentList: {
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  commentCard: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  commentText: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  commentMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  emptyText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  primaryActions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  memberList: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
