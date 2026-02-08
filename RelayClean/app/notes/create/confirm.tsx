import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { NotesShell } from '../components/NotesShell';
import { useNotesStore } from '../notes-context';

export default function CreateNoteConfirmScreen() {
  const router = useRouter() as any;
  const { state, addNote, clearNoteDraft } = useNotesStore();

  const draft = state.noteDraft;

  if (!draft) {
    return (
      <NotesShell title="Confirm Note" subtitle="No draft" onBack={() => router.replace('/notes')}>
        <EmptyState title="No draft to confirm" body="Create a note first." />
      </NotesShell>
    );
  }

  const tagLabels = state.tags.filter((tag) => draft.tagIds.includes(tag.id)).map((tag) => tag.label).join(', ') || 'No tags';

  return (
    <NotesShell title="Confirm Note" subtitle="Relay understood this" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>{draft.title}</Text>
        <Text style={styles.body}>{draft.body}</Text>

        <View style={styles.metaWrap}>
          <Text style={styles.meta}>Mode: {draft.mode}</Text>
          <Text style={styles.meta}>Category: {draft.categorySlug}</Text>
          <Text style={styles.meta}>Tags: {tagLabels}</Text>
          <Text style={styles.meta}>Pinned: {draft.pinned ? 'Yes' : 'No'}</Text>
        </View>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            const id = addNote({
              title: draft.title,
              body: draft.body,
              categorySlug: draft.categorySlug,
              tagIds: draft.tagIds,
              checklist: [],
              pinned: draft.pinned,
              archived: false,
              source: draft.mode,
              shared: false,
              addedBy: 'Jaiden',
              aiSummary: draft.body.split('.').at(0) || draft.title,
              relatedNoteIds: [],
            });
            clearNoteDraft();
            router.replace(`/notes/note/${id}`);
          }}
        />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.back()} />
        <BubbleChip
          icon="close"
          label="Cancel"
          tone="neutral"
          onPress={() => {
            clearNoteDraft();
            router.replace('/notes');
          }}
        />
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
  },
  body: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  metaWrap: {
    marginTop: ds.spacing.s12,
    gap: ds.spacing.s4,
  },
  meta: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
