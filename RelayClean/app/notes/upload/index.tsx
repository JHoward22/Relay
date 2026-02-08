import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { NotesShell, NotesTalkSheet } from '../components/NotesShell';
import { DocType, useNotesStore } from '../notes-context';

export default function UploadDocScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ type?: DocType; category?: string }>();
  const { state, setDocDraft } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<DocType>(params.type || 'pdf');
  const [categorySlug, setCategorySlug] = useState(params.category || 'documents');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [fileLabel, setFileLabel] = useState('No file selected yet');

  return (
    <NotesShell title="Upload Document" subtitle="PDF, image, or text" onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="Insurance details" />
      <FormField label="File label" value={fileLabel} onChangeText={setFileLabel} placeholder="e.g., upload_2026_02_07.pdf" />

      <View style={styles.typeRow}>
        {(['pdf', 'image', 'text'] as const).map((entry) => (
          <BubbleChip
            key={entry}
            icon={type === entry ? 'checkmark' : entry === 'pdf' ? 'document-outline' : entry === 'image' ? 'image-outline' : 'document-text-outline'}
            label={entry.toUpperCase()}
            tone={type === entry ? 'primary' : 'neutral'}
            onPress={() => setType(entry)}
          />
        ))}
      </View>

      <View style={styles.metaRow}>
        {state.categories
          .filter((category) => category.slug !== 'archive')
          .slice(0, 4)
          .map((category) => (
            <BubbleChip
              key={category.id}
              icon={categorySlug === category.slug ? 'checkmark' : 'folder-outline'}
              label={category.name}
              tone={categorySlug === category.slug ? 'primary' : 'neutral'}
              onPress={() => setCategorySlug(category.slug)}
            />
          ))}
      </View>

      <View style={styles.metaRow}>
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

      <Text style={styles.helper}>Scan support is future-ready; this flow saves mock metadata now.</Text>

      <PrimaryButton
        label="Continue"
        onPress={() => {
          setDocDraft({
            name: name.trim() || 'Untitled document',
            type,
            categorySlug,
            tagIds,
            fileLabel,
          });
          router.push('/notes/upload/confirm');
        }}
      />
      <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  helper: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
