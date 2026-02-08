import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { NotesShell, NotesTalkSheet } from '../components/NotesShell';
import { NoteSource, useNotesStore } from '../notes-context';

export default function CreateNoteScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ mode?: NoteSource; category?: string }>();
  const { state, setNoteDraft } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [mode, setMode] = useState<NoteSource>(params.mode || 'manual');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categorySlug, setCategorySlug] = useState(params.category || 'personal');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const titleHint = useMemo(() => {
    if (!body.trim()) return 'Relay can suggest a title after you write.';
    return `Suggested title: ${body.split('.').at(0)?.slice(0, 36) || 'Quick note'}`;
  }, [body]);

  return (
    <NotesShell title="Create Note" subtitle="Text, voice, or mixed" onBack={() => router.back()}>
      <View style={styles.modeRow}>
        {(['manual', 'voice', 'mixed'] as const).map((item) => (
          <BubbleChip
            key={item}
            icon={mode === item ? 'checkmark' : item === 'voice' ? 'mic-outline' : item === 'mixed' ? 'sparkles-outline' : 'create-outline'}
            label={item === 'manual' ? 'Text' : item === 'voice' ? 'Voice' : 'Mixed'}
            tone={mode === item ? 'primary' : 'neutral'}
            onPress={() => setMode(item)}
          />
        ))}
      </View>

      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Weekly planning notes" />
      <FormField label="Body" value={body} onChangeText={setBody} placeholder="Capture what matters" multiline numberOfLines={8} />

      <View style={styles.aiHintWrap}>
        <Text style={styles.aiHintTitle}>AI title hint</Text>
        <Text style={styles.aiHintBody}>{titleHint}</Text>
      </View>

      <View style={styles.metaRow}>
        <BubbleChip icon="folder-outline" label={`Category: ${categorySlug}`} tone="neutral" onPress={() => setCategoryOpen(true)} />
        <BubbleChip icon={pinned ? 'bookmark' : 'bookmark-outline'} label={pinned ? 'Pinned' : 'Pin'} tone={pinned ? 'success' : 'neutral'} onPress={() => setPinned((prev) => !prev)} />
      </View>

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
        label="Save"
        onPress={() => {
          setNoteDraft({
            mode,
            title: title.trim() || 'Untitled note',
            body: body.trim() || 'No details yet.',
            categorySlug,
            tagIds,
            pinned,
          });
          router.push('/notes/create/confirm');
        }}
      />
      <SecondaryButton label="Ask Relay about this note" onPress={() => setTalkOpen(true)} />

      <SheetModal visible={categoryOpen} onClose={() => setCategoryOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Choose category</Text>
          <View style={styles.sheetTags}>
            {state.categories
              .filter((category) => category.slug !== 'archive')
              .map((category) => (
                <BubbleChip
                  key={category.id}
                  icon={categorySlug === category.slug ? 'checkmark' : 'folder-outline'}
                  label={category.name}
                  tone={categorySlug === category.slug ? 'primary' : 'neutral'}
                  onPress={() => {
                    setCategorySlug(category.slug);
                    setCategoryOpen(false);
                  }}
                />
              ))}
          </View>
          <BubbleChip icon="close" label="Close" tone="neutral" onPress={() => setCategoryOpen(false)} />
        </View>
      </SheetModal>

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  aiHintWrap: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  aiHintTitle: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '700',
    marginBottom: ds.spacing.s4,
  },
  aiHintBody: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
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
  sheetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
