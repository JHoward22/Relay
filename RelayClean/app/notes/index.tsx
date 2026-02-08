import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { NotesSectionCard, NotesShell, NotesTalkSheet, NotesVoiceHint } from './components/NotesShell';
import { formatDateTimeLabel, useNotesStore } from './notes-context';

export default function NotesHomeScreen() {
  const router = useRouter() as any;
  const { state: relayState } = useRelayStore();
  const { state, suggestions, dismissSuggestion } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [query, setQuery] = useState('');

  const pinnedItems = useMemo(() => {
    const notes = state.notes
      .filter((item) => !item.archived && item.pinned)
      .map((item) => ({ id: item.id, title: item.title, body: item.aiSummary, route: `/notes/note/${item.id}` }));

    const docs = state.documents
      .filter((item) => !item.archived && item.pinned)
      .map((item) => ({ id: item.id, title: item.name, body: item.aiSummary, route: `/notes/doc/${item.id}` }));

    return [...notes, ...docs].slice(0, 3);
  }, [state.documents, state.notes]);

  const recentItems = useMemo(() => {
    const notes = state.notes
      .filter((item) => !item.archived)
      .map((item) => ({ id: `note-${item.id}`, title: item.title, meta: `Note · ${formatDateTimeLabel(item.updatedAtISO)}`, route: `/notes/note/${item.id}`, icon: 'document-text-outline' as const }));

    const docs = state.documents
      .filter((item) => !item.archived)
      .map((item) => ({ id: `doc-${item.id}`, title: item.name, meta: `Doc · ${formatDateTimeLabel(item.updatedAtISO)}`, route: `/notes/doc/${item.id}`, icon: 'folder-outline' as const }));

    const journal = state.journalEntries
      .filter((item) => !item.archived)
      .map((item) => ({ id: `journal-${item.id}`, title: item.title, meta: `Journal · ${item.dateISO}`, route: `/notes/journal/entry/${item.id}`, icon: 'book-outline' as const }));

    return [...notes, ...docs, ...journal].sort((a, b) => b.meta.localeCompare(a.meta)).slice(0, 5);
  }, [state.documents, state.journalEntries, state.notes]);

  const topSuggestion = suggestions[0] ?? null;

  return (
    <NotesShell
      title="Notes & Docs"
      subtitle="Capture fast. Find fast."
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/notes/create') },
        { icon: 'mic-outline', label: 'Ask', onPress: () => setTalkOpen(true) },
      ]}
    >
      <NotesSectionCard title="Capture & Find" rightLabel="Upload" onRightPress={() => router.push('/notes/upload')}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={ds.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find a note or document"
            placeholderTextColor="#8A95AD"
            style={styles.searchInput}
            onSubmitEditing={() => router.push({ pathname: '/notes/search', params: { q: query } })}
          />
          <Pressable onPress={() => router.push({ pathname: '/notes/search', params: { q: query } })}>
            <Text style={styles.searchAction}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.captureGrid}>
          <Pressable style={styles.captureTile} onPress={() => router.push('/notes/create?mode=voice')}>
            <Ionicons name="mic-outline" size={18} color={ds.colors.primary} />
            <Text style={styles.captureTitle}>Voice Note</Text>
            <Text style={styles.captureBody}>Speak naturally, relay structures it</Text>
          </Pressable>

          <Pressable style={styles.captureTile} onPress={() => router.push('/notes/create?mode=manual')}>
            <Ionicons name="create-outline" size={18} color={ds.colors.primary} />
            <Text style={styles.captureTitle}>New Note</Text>
            <Text style={styles.captureBody}>Quick text capture with tags</Text>
          </Pressable>
        </View>
      </NotesSectionCard>

      <NotesSectionCard title="Important & Recent" rightLabel="All activity" onRightPress={() => router.push('/notes/search')}>
        {pinnedItems.length ? (
          <View style={styles.pinnedWrap}>
            {pinnedItems.map((item) => (
              <View key={item.id} style={styles.rowWrap}>
                <ListRow icon="pin-outline" label={item.title} body={item.body} rightText="Pinned" onPress={() => router.push(item.route)} />
              </View>
            ))}
          </View>
        ) : null}

        {recentItems.length ? (
          recentItems.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow icon={item.icon} label={item.title} body={item.meta} onPress={() => router.push(item.route)} />
            </View>
          ))
        ) : (
          <EmptyState title="Nothing here yet" body="Capture your first note or upload a document." />
        )}
      </NotesSectionCard>

      {topSuggestion ? (
        <GlassCard blur>
          <Text style={styles.insightEyebrow}>Top Insight</Text>
          <Text style={styles.insightTitle}>{topSuggestion.title}</Text>
          <Text style={styles.insightBody}>{topSuggestion.body}</Text>
          <View style={styles.chipsRow}>
            <BubbleChip icon="checkmark" label="Do it" tone="success" onPress={() => router.push(topSuggestion.route)} />
            <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={() => dismissSuggestion(topSuggestion.id)} />
          </View>
        </GlassCard>
      ) : null}

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More spaces</Text>
        <View style={styles.chipsRow}>
          <BubbleChip icon="folder-outline" label="Documents" tone="neutral" onPress={() => router.push('/notes/category/documents')} />
          <BubbleChip icon="book-outline" label="Journal" tone="neutral" onPress={() => router.push('/notes/journal')} />
          <BubbleChip icon="archive-outline" label="Archive" tone="neutral" onPress={() => router.push('/notes/archive')} />
          {relayState.familyModeEnabled ? (
            <BubbleChip icon="people-outline" label="Family" tone="neutral" onPress={() => router.push('/family')} />
          ) : null}
        </View>
      </GlassCard>

      <NotesVoiceHint label="Try saying: find my tax notes" onAsk={() => setTalkOpen(true)} />
      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    minHeight: 44,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.74)',
    paddingHorizontal: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
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
  searchAction: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  captureGrid: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  captureTile: {
    flex: 1,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    gap: ds.spacing.s4,
    ...ds.shadow.soft,
  },
  captureTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  captureBody: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  pinnedWrap: {
    marginBottom: ds.spacing.s8,
  },
  rowWrap: {
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
  },
  insightTitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 21,
    color: ds.colors.text,
    fontWeight: '700',
  },
  insightBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
    marginTop: ds.spacing.s8,
  },
});
