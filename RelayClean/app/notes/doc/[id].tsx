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

export default function DocumentDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDocument, state, togglePinDocument, moveDocument } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const doc = useMemo(() => getDocument(id), [getDocument, id]);

  if (!doc) {
    return (
      <NotesShell title="Document" subtitle="Not found" onBack={() => router.replace('/notes')}>
        <EmptyState title="Document not found" body="Return to Notes home." />
      </NotesShell>
    );
  }

  const tags = state.tags.filter((tag) => doc.tagIds.includes(tag.id));

  return (
    <NotesShell title={doc.name} subtitle="Document detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewWrap}>
          <Text style={styles.previewText}>{doc.type.toUpperCase()} preview unavailable in demo mode</Text>
        </View>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.sectionTitle}>Metadata</Text>
        <Text style={styles.meta}>Type: {doc.type.toUpperCase()}</Text>
        <Text style={styles.meta}>Category: {doc.categorySlug}</Text>
        <Text style={styles.meta}>Updated: {formatDateTimeLabel(doc.updatedAtISO)}</Text>
        <Text style={styles.meta}>Tags: {tags.map((tag) => tag.label).join(', ') || 'None'}</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.insightEyebrow}>Top Insight</Text>
        <Text style={styles.sectionTitle}>AI Extracted Summary</Text>
        <Text style={styles.body}>{doc.aiSummary}</Text>
        <Text style={styles.body}>{doc.extractedText}</Text>
      </GlassCard>

      <View style={styles.primaryActions}>
        <PrimaryButton label="Rename" onPress={() => router.push(`/notes/doc/${doc.id}/rename`)} style={styles.flex} />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} style={styles.flex} />
      </View>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.actions}>
          <BubbleChip icon="pricetags-outline" label="Tag" tone="neutral" onPress={() => router.push(`/notes/doc/${doc.id}/tags`)} />
          <BubbleChip icon="swap-horizontal-outline" label="Move" tone="neutral" onPress={() => setMoveOpen(true)} />
          <BubbleChip icon={doc.pinned ? 'bookmark' : 'bookmark-outline'} label={doc.pinned ? 'Unpin' : 'Pin'} tone="neutral" onPress={() => togglePinDocument(doc.id)} />
          <BubbleChip icon="archive-outline" label="Archive" tone="danger" onPress={() => router.push({ pathname: '/notes/archive/confirm', params: { type: 'doc', id: doc.id } })} />
        </View>
      </GlassCard>

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />

      <SheetModal visible={moveOpen} onClose={() => setMoveOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sectionTitle}>Move document</Text>
          <View style={styles.actions}>
            {state.categories
              .filter((category) => category.slug !== 'archive')
              .map((category) => (
                <BubbleChip
                  key={category.id}
                  icon={doc.categorySlug === category.slug ? 'checkmark' : 'folder-outline'}
                  label={category.name}
                  tone={doc.categorySlug === category.slug ? 'primary' : 'neutral'}
                  onPress={() => {
                    moveDocument(doc.id, category.slug);
                    setMoveOpen(false);
                  }}
                />
              ))}
          </View>
          <BubbleChip icon="close" label="Done" tone="neutral" onPress={() => setMoveOpen(false)} />
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
  previewWrap: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.64)',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  meta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  body: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
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
});
