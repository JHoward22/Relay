import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { NotesSectionCard, NotesShell } from '../components/NotesShell';
import { NotesFilter, useNotesStore } from '../notes-context';

export default function NotesSearchScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ q?: string; type?: NotesFilter['type']; category?: string }>();
  const { state, search } = useNotesStore();

  const [query, setQuery] = useState(params.q || '');
  const [type, setType] = useState<NotesFilter['type']>(params.type || 'all');
  const [categorySlug, setCategorySlug] = useState<string | undefined>(params.category);
  const [time, setTime] = useState<NotesFilter['time']>('any');
  const [tagId, setTagId] = useState<string | undefined>(undefined);

  const filter = useMemo<NotesFilter>(() => ({ categorySlug, type, time, tagId }), [categorySlug, type, time, tagId]);
  const results = useMemo(() => search(query, filter), [search, query, filter]);

  return (
    <NotesShell title="Search" subtitle="Semantic-ready results" onBack={() => router.back()}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={ds.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find notes, docs, ideas"
          placeholderTextColor="#8A95AD"
          style={styles.searchInput}
        />
        <Pressable onPress={() => setQuery('')}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>

      <NotesSectionCard title="Filters">
        <View style={styles.filters}>
          {(['all', 'note', 'doc', 'journal'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={type === entry ? 'checkmark' : 'options-outline'}
              label={entry === 'all' ? 'All' : entry}
              tone={type === entry ? 'primary' : 'neutral'}
              onPress={() => setType(entry)}
            />
          ))}
        </View>

        <View style={styles.filters}>
          {state.categories.slice(0, 5).map((category) => (
            <BubbleChip
              key={category.id}
              icon={categorySlug === category.slug ? 'checkmark' : 'folder-outline'}
              label={category.name}
              tone={categorySlug === category.slug ? 'primary' : 'neutral'}
              onPress={() => setCategorySlug((prev) => (prev === category.slug ? undefined : category.slug))}
            />
          ))}
        </View>

        <View style={styles.filters}>
          {(['any', '7d', '30d'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={time === entry ? 'checkmark' : 'calendar-outline'}
              label={entry === 'any' ? 'Any time' : entry}
              tone={time === entry ? 'primary' : 'neutral'}
              onPress={() => setTime(entry)}
            />
          ))}
        </View>

        <View style={styles.filters}>
          {state.tags.map((tag) => {
            const active = tagId === tag.id;
            return (
              <BubbleChip
                key={tag.id}
                icon={active ? 'checkmark' : 'pricetag-outline'}
                label={tag.label}
                tone={active ? 'success' : 'neutral'}
                onPress={() => setTagId((prev) => (prev === tag.id ? undefined : tag.id))}
              />
            );
          })}
        </View>
      </NotesSectionCard>

      <NotesSectionCard title="Results">
        {results.length ? results.map((result) => (
          <View key={`${result.type}-${result.id}`} style={styles.rowWrap}>
            <ListRow
              icon={result.type === 'note' ? 'document-text-outline' : result.type === 'doc' ? 'folder-outline' : result.type === 'journal' ? 'book-outline' : 'sparkles-outline'}
              label={result.title}
              body={result.subtitle}
              onPress={() => router.push(result.route)}
            />
          </View>
        )) : <EmptyState title="No matches" body="Try broadening your search with fewer filters." />}
      </NotesSectionCard>
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    minHeight: 44,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingHorizontal: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  clear: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
});
