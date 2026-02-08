import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { NotesShell, NotesTalkSheet } from '../components/NotesShell';
import { formatDateTimeLabel, useNotesStore } from '../notes-context';

export default function NoteDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, state, moveNote, togglePinNote } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const note = useMemo(() => getNote(id), [getNote, id]);

  if (!note) {
    return (
      <NotesShell title="Note" subtitle="Not found" onBack={() => router.replace('/notes')}>
        <EmptyState title="Note not found" body="Return to Notes home." />
      </NotesShell>
    );
  }

  const tags = state.tags.filter((tag) => note.tagIds.includes(tag.id));
  const related = state.notes.filter((entry) => note.relatedNoteIds.includes(entry.id));

  return (
    <NotesShell title={note.title} subtitle="Note detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.body}>{note.body}</Text>
        <Text style={styles.meta}>Updated {formatDateTimeLabel(note.updatedAtISO)} · Source {note.source}</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.sectionTitle}>Metadata</Text>
        <Text style={styles.meta}>Category: {note.categorySlug}</Text>
        <Text style={styles.meta}>Tags: {tags.map((tag) => tag.label).join(', ') || 'None'}</Text>
        <Text style={styles.meta}>Added by: {note.addedBy}</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.insightEyebrow}>Top Insight</Text>
        <Text style={styles.sectionTitle}>AI Summary</Text>
        <Text style={styles.body}>{note.aiSummary}</Text>
      </GlassCard>

      {related.length ? (
        <GlassCard blur>
          <Text style={styles.sectionTitle}>Related Notes</Text>
          {related.map((entry) => (
            <View key={entry.id} style={styles.relatedRow}>
              <Text style={styles.relatedTitle}>{entry.title}</Text>
              <BubbleChip icon="arrow-forward" compact tone="neutral" onPress={() => router.push(`/notes/note/${entry.id}`)} />
            </View>
          ))}
        </GlassCard>
      ) : null}

      <View style={styles.primaryActions}>
        <PrimaryButton label="Edit Note" onPress={() => router.push(`/notes/note/${note.id}/edit`)} style={styles.flex} />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} style={styles.flex} />
      </View>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.actions}>
          <BubbleChip icon="share-outline" label="Share" tone="neutral" onPress={() => setShareOpen(true)} />
          <BubbleChip icon="swap-horizontal-outline" label="Move" tone="neutral" onPress={() => setMoveOpen(true)} />
          <BubbleChip icon={note.pinned ? 'bookmark' : 'bookmark-outline'} label={note.pinned ? 'Unpin' : 'Pin'} tone="neutral" onPress={() => togglePinNote(note.id)} />
          <BubbleChip icon="archive-outline" label="Archive" tone="danger" onPress={() => router.push({ pathname: '/notes/archive/confirm', params: { type: 'note', id: note.id } })} />
        </View>
      </GlassCard>

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />

      <SheetModal visible={moveOpen} onClose={() => setMoveOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Move note to category</Text>
          <View style={styles.sheetActions}>
            {state.categories
              .filter((category) => category.slug !== 'archive')
              .map((category) => (
                <BubbleChip
                  key={category.id}
                  icon={note.categorySlug === category.slug ? 'checkmark' : 'folder-outline'}
                  label={category.name}
                  tone={note.categorySlug === category.slug ? 'primary' : 'neutral'}
                  onPress={() => {
                    moveNote(note.id, category.slug);
                    setMoveOpen(false);
                  }}
                />
              ))}
          </View>
          <BubbleChip icon="close" label="Done" tone="neutral" onPress={() => setMoveOpen(false)} />
        </View>
      </SheetModal>

      <SheetModal visible={shareOpen} onClose={() => setShareOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Share note</Text>
          <Text style={styles.sheetBody}>Share flow is mocked. Choose a destination.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip icon="mail-outline" label="Email" tone="primary" onPress={() => { setShareOpen(false); router.push('/help/contact'); }} />
            <BubbleChip icon="chatbubble-outline" label="Message" tone="primary" onPress={() => { setShareOpen(false); router.push('/settings/connections/messages'); }} />
            <BubbleChip icon="people-outline" label="Family" tone="neutral" onPress={() => { setShareOpen(false); router.push('/family'); }} />
          </View>
          <BubbleChip icon="close" label="Close" tone="neutral" onPress={() => setShareOpen(false)} />
        </View>
      </SheetModal>
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  insightEyebrow: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: ds.spacing.s8,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  meta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds.spacing.s8,
  },
  relatedTitle: {
    flex: 1,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  primaryActions: {
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
    marginBottom: ds.spacing.s8,
  },
  sheetWrap: {
    gap: ds.spacing.s12,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
