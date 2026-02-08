import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function PetNoteDetailScreen() {
  const router = useRouter() as any;
  const { id, noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const { state, deleteNote } = usePetsStore();

  const note = useMemo(
    () => state.notes.find((item) => item.id === noteId && item.petId === id),
    [id, noteId, state.notes]
  );

  if (!note) {
    return (
      <PetsShell title="Note" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/notes`)}>
        <EmptyState title="Note not found" body="Return to notes list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title={note.title} subtitle="Pet note" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.body}>{note.body}</Text>
        <Text style={styles.meta}>Updated {new Date(note.updatedAtISO).toLocaleString()}</Text>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push(`/pets/profile/${id}/notes/${note.id}/edit`)} />
        <BubbleChip icon="mic" label="Voice summary" tone="neutral" onPress={() => router.push('/pets/voice-summary')} />
        <BubbleChip
          icon="trash-outline"
          label="Delete"
          tone="danger"
          onPress={() => {
            deleteNote(note.id);
            router.replace(`/pets/profile/${id}/notes`);
          }}
        />
      </View>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  meta: {
    marginTop: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
