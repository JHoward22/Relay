import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { NotesSectionCard, NotesShell, NotesTalkSheet } from '../components/NotesShell';
import { useNotesStore } from '../notes-context';

export default function NotesCategoryScreen() {
  const router = useRouter() as any;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { getCategory, state } = useNotesStore();

  const [typeFilter, setTypeFilter] = useState<'all' | 'note' | 'doc'>('all');
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<'any' | '7d' | '30d'>('any');
  const [talkOpen, setTalkOpen] = useState(false);

  const category = useMemo(() => getCategory(slug), [getCategory, slug]);

  const notes = state.notes.filter((item) => !item.archived && item.categorySlug === slug);
  const docs = state.documents.filter((item) => !item.archived && item.categorySlug === slug);

  const filteredNotes = notes.filter((item) => {
    const matchesTag = tagFilter ? item.tagIds.includes(tagFilter) : true;
    if (!matchesTag) return false;
    if (dateFilter === 'any') return true;
    const d = new Date(item.updatedAtISO);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - (dateFilter === '7d' ? 7 : 30));
    return d >= threshold;
  });

  const filteredDocs = docs.filter((item) => {
    const matchesTag = tagFilter ? item.tagIds.includes(tagFilter) : true;
    if (!matchesTag) return false;
    if (dateFilter === 'any') return true;
    const d = new Date(item.updatedAtISO);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - (dateFilter === '7d' ? 7 : 30));
    return d >= threshold;
  });

  return (
    <NotesShell title={category?.name ?? 'Category'} subtitle={category?.description ?? 'Notes space'} onBack={() => router.back()}>
      <NotesSectionCard title="Filters">
        <View style={styles.filters}>
          {(['all', 'note', 'doc'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={typeFilter === entry ? 'checkmark' : 'options-outline'}
              label={entry === 'all' ? 'All' : entry === 'note' ? 'Notes' : 'Docs'}
              tone={typeFilter === entry ? 'primary' : 'neutral'}
              onPress={() => setTypeFilter(entry)}
            />
          ))}
        </View>

        <View style={styles.filters}>
          {(['any', '7d', '30d'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={dateFilter === entry ? 'checkmark' : 'calendar-outline'}
              label={entry === 'any' ? 'Any time' : entry}
              tone={dateFilter === entry ? 'primary' : 'neutral'}
              onPress={() => setDateFilter(entry)}
            />
          ))}
        </View>

        <View style={styles.filters}>
          {state.tags.map((tag) => {
            const active = tagFilter === tag.id;
            return (
              <BubbleChip
                key={tag.id}
                icon={active ? 'checkmark' : 'pricetag-outline'}
                label={tag.label}
                tone={active ? 'success' : 'neutral'}
                onPress={() => setTagFilter((prev) => (prev === tag.id ? undefined : tag.id))}
              />
            );
          })}
        </View>
      </NotesSectionCard>

      <NotesSectionCard title="Items">
        {(typeFilter === 'all' || typeFilter === 'note') && filteredNotes.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon="document-text-outline"
              label={item.title}
              body={item.aiSummary}
              onPress={() => router.push(`/notes/note/${item.id}`)}
            />
          </View>
        ))}

        {(typeFilter === 'all' || typeFilter === 'doc') && filteredDocs.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon="folder-outline"
              label={item.name}
              body={item.aiSummary}
              onPress={() => router.push(`/notes/doc/${item.id}`)}
            />
          </View>
        ))}

        {!filteredNotes.length && !filteredDocs.length ? (
          <EmptyState title="No items in this space" body="Add a note or document to populate this category." />
        ) : null}
      </NotesSectionCard>

      <NotesSectionCard title="Actions">
        <View style={styles.filters}>
          <BubbleChip icon="add" label="Add note" tone="primary" onPress={() => router.push(`/notes/create?category=${slug}`)} />
          <BubbleChip icon="document-attach-outline" label="Add doc" tone="primary" onPress={() => router.push(`/notes/upload?category=${slug}`)} />
          <BubbleChip icon="mic" label="Voice capture" tone="neutral" onPress={() => setTalkOpen(true)} />
        </View>
      </NotesSectionCard>

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
});
