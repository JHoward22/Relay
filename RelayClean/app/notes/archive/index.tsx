import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { NotesSectionCard, NotesShell } from '../components/NotesShell';
import { useNotesStore } from '../notes-context';

export default function NotesArchiveScreen() {
  const router = useRouter() as any;
  const { state, archiveNote, archiveDocument, archiveJournalEntry } = useNotesStore();

  const archivedNotes = state.notes.filter((item) => item.archived);
  const archivedDocs = state.documents.filter((item) => item.archived);
  const archivedJournal = state.journalEntries.filter((item) => item.archived);

  return (
    <NotesShell title="Archive" subtitle="Restore or permanently delete" onBack={() => router.back()}>
      {!archivedNotes.length && !archivedDocs.length && !archivedJournal.length ? (
        <EmptyState title="Archive is empty" body="Archived notes and docs will appear here." />
      ) : null}

      <NotesSectionCard title="Archived Notes">
        {archivedNotes.length ? archivedNotes.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon="document-text-outline"
              label={item.title}
              body="Archived note"
              onPress={() => router.push(`/notes/note/${item.id}`)}
              trailing={
                <View style={styles.trailingWrap}>
                  <BubbleChip icon="arrow-undo-outline" compact tone="success" onPress={() => archiveNote(item.id, false)} />
                  <BubbleChip icon="trash-outline" compact tone="danger" onPress={() => router.push({ pathname: '/notes/archive/confirm', params: { type: 'note', id: item.id, op: 'delete' } })} />
                </View>
              }
            />
          </View>
        )) : <EmptyState title="No archived notes" body="Archive notes to declutter your spaces." />}
      </NotesSectionCard>

      <NotesSectionCard title="Archived Documents">
        {archivedDocs.length ? archivedDocs.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon="folder-outline"
              label={item.name}
              body="Archived document"
              onPress={() => router.push(`/notes/doc/${item.id}`)}
              trailing={
                <View style={styles.trailingWrap}>
                  <BubbleChip icon="arrow-undo-outline" compact tone="success" onPress={() => archiveDocument(item.id, false)} />
                  <BubbleChip icon="trash-outline" compact tone="danger" onPress={() => router.push({ pathname: '/notes/archive/confirm', params: { type: 'doc', id: item.id, op: 'delete' } })} />
                </View>
              }
            />
          </View>
        )) : <EmptyState title="No archived docs" body="Archive docs to keep active spaces clean." />}
      </NotesSectionCard>

      <NotesSectionCard title="Archived Journal">
        {archivedJournal.length ? archivedJournal.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon="book-outline"
              label={item.title}
              body="Archived journal entry"
              onPress={() => router.push(`/notes/journal/entry/${item.id}`)}
              trailing={
                <View style={styles.trailingWrap}>
                  <BubbleChip icon="arrow-undo-outline" compact tone="success" onPress={() => archiveJournalEntry(item.id, false)} />
                  <BubbleChip icon="trash-outline" compact tone="danger" onPress={() => router.push({ pathname: '/notes/archive/confirm', params: { type: 'journal', id: item.id, op: 'delete' } })} />
                </View>
              }
            />
          </View>
        )) : <EmptyState title="No archived journal entries" body="Archived entries can be restored anytime." />}
      </NotesSectionCard>
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  trailingWrap: {
    flexDirection: 'row',
    gap: ds.spacing.s4,
  },
});
