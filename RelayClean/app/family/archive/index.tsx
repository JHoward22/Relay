import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyArchiveScreen() {
  const router = useRouter() as any;
  const { state, updateTask, archiveDocument } = useFamilyStore();

  const archivedTasks = state.tasks.filter((task) => task.archived);
  const archivedDocs = state.documents.filter((doc) => doc.archived);

  return (
    <FamilyShell title="Archive" subtitle="Restorable shared items" onBack={() => router.back()}>
      <FamilySectionCard title="Archived tasks">
        {archivedTasks.length ? (
          <View style={styles.listWrap}>
            {archivedTasks.map((task) => (
              <ListRow
                key={task.id}
                icon="archive-outline"
                label={task.title}
                body={task.dueDateISO}
                trailing={<BubbleChip compact icon="arrow-undo-outline" tone="neutral" onPress={() => updateTask(task.id, { archived: false })} />}
                onPress={() => router.push(`/family/tasks/${task.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No archived tasks" body="Completed and archived tasks will appear here." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Archived documents">
        {archivedDocs.length ? (
          <View style={styles.listWrap}>
            {archivedDocs.map((doc) => (
              <ListRow
                key={doc.id}
                icon="document-outline"
                label={doc.name}
                body={doc.aiSummary}
                trailing={<BubbleChip compact icon="arrow-undo-outline" tone="neutral" onPress={() => archiveDocument(doc.id, false)} />}
                onPress={() => router.push(`/family/documents/${doc.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No archived documents" body="Archived files can be restored here." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Shortcuts">
        <View style={styles.actions}>
          <BubbleChip icon="checkbox-outline" label="Tasks" tone="neutral" onPress={() => router.push('/family/tasks')} />
          <BubbleChip icon="document-text-outline" label="Documents" tone="neutral" onPress={() => router.push('/family/documents')} />
          <BubbleChip icon="settings-outline" label="Settings" tone="neutral" onPress={() => router.push('/family/settings')} />
        </View>
      </FamilySectionCard>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
