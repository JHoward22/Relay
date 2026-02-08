import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { FormField } from '@/components/relay/FormField';
import { EmptyState } from '@/components/relay/EmptyState';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function FamilyDocumentDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDocument, state, updateDocument, archiveDocument } = useFamilyStore();

  const document = getDocument(id);
  const [name, setName] = useState(document?.name ?? '');
  const [summary, setSummary] = useState(document?.aiSummary ?? '');

  const allowedNames = useMemo(() => {
    if (!document) return '';
    return document.allowedMemberIds
      .map((memberId) => state.members.find((member) => member.id === memberId)?.name)
      .filter(Boolean)
      .join(', ');
  }, [document, state.members]);

  if (!document) {
    return (
      <FamilyShell title="Document" onBack={() => router.back()}>
        <EmptyState title="Document not found" body="This file may have been archived or removed." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={document.name} subtitle={document.visibility === 'shared' ? 'Shared document' : 'Restricted document'} onBack={() => router.back()}>
      <FamilySectionCard title="Metadata">
        <Text style={styles.body}>Type: {document.docType.toUpperCase()}</Text>
        <Text style={styles.body}>Allowed members: {allowedNames || 'None selected'}</Text>
        <Text style={styles.body}>Tags: {document.tagIds.join(', ') || 'No tags'}</Text>
      </FamilySectionCard>

      <FamilySectionCard title="Edit details">
        <FormField label="Name" value={name} onChangeText={setName} />
        <FormField
          label="AI summary"
          value={summary}
          onChangeText={setSummary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <View style={styles.actions}>
          <BubbleChip icon="save-outline" label="Save" tone="primary" onPress={() => updateDocument(document.id, { name, aiSummary: summary })} />
          <BubbleChip
            icon="lock-closed-outline"
            label={document.visibility === 'shared' ? 'Restrict' : 'Share'}
            tone="neutral"
            onPress={() => updateDocument(document.id, { visibility: document.visibility === 'shared' ? 'restricted' : 'shared' })}
          />
          <BubbleChip
            icon="archive-outline"
            label={document.archived ? 'Restore' : 'Archive'}
            tone="neutral"
            onPress={() => {
              archiveDocument(document.id, !document.archived);
              router.replace(document.archived ? `/family/documents/${document.id}` : '/family/archive');
            }}
          />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Summarize this document for parents only.'" onAsk={() => router.push('/family/voice-summary')} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
    marginBottom: ds.spacing.s4,
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
