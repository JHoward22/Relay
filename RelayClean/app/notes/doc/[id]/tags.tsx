import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ds } from '@/constants/design-system';
import { NotesShell } from '../../components/NotesShell';
import { useNotesStore } from '../../notes-context';

export default function DocTagsScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDocument, state, setDocTags } = useNotesStore();

  const doc = useMemo(() => getDocument(id), [getDocument, id]);
  const [tagIds, setTagIds] = useState<string[]>(doc?.tagIds ?? []);

  if (!doc) {
    return (
      <NotesShell title="Document Tags" subtitle="Not found" onBack={() => router.replace('/notes')}>
        <EmptyState title="Document not found" body="Return to Notes home." />
      </NotesShell>
    );
  }

  return (
    <NotesShell title="Document Tags" subtitle={doc.name} onBack={() => router.back()}>
      <View style={styles.tagsWrap}>
        {state.tags.map((tag) => {
          const active = tagIds.includes(tag.id);
          return (
            <BubbleChip
              key={tag.id}
              icon={active ? 'checkmark' : 'pricetag-outline'}
              label={tag.label}
              tone={active ? 'success' : 'neutral'}
              onPress={() =>
                setTagIds((prev) =>
                  prev.includes(tag.id) ? prev.filter((entry) => entry !== tag.id) : [...prev, tag.id]
                )
              }
            />
          );
        })}
      </View>

      <PrimaryButton
        label="Save tags"
        onPress={() => {
          setDocTags(doc.id, tagIds);
          router.replace(`/notes/doc/${doc.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
