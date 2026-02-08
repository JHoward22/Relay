import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { NotesShell } from '../components/NotesShell';
import { useNotesStore } from '../notes-context';

export default function ArchiveConfirmScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ type?: 'note' | 'doc' | 'journal'; id?: string; op?: 'archive' | 'delete' }>();
  const { archiveNote, archiveDocument, archiveJournalEntry, deleteNote, deleteDocument, deleteJournalEntry } = useNotesStore();

  const type = params.type || 'note';
  const id = params.id || '';
  const op = params.op || 'archive';

  const title =
    op === 'delete'
      ? 'Permanently delete this item?'
      : 'Archive this item?';

  const body =
    op === 'delete'
      ? 'This action cannot be undone in this demo flow.'
      : 'This item will move to Archive and can be restored later.';

  return (
    <NotesShell title="Confirm Action" subtitle="Safety check" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="danger"
          onPress={() => {
            if (!id) {
              router.replace('/notes/archive');
              return;
            }

            if (type === 'note') {
              if (op === 'delete') deleteNote(id);
              else archiveNote(id, true);
            } else if (type === 'doc') {
              if (op === 'delete') deleteDocument(id);
              else archiveDocument(id, true);
            } else {
              if (op === 'delete') deleteJournalEntry(id);
              else archiveJournalEntry(id, true);
            }

            router.replace(op === 'delete' ? '/notes/archive' : '/notes');
          }}
        />
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.back()} />
      </View>
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
