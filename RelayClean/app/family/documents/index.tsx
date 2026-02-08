import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyDocumentsScreen() {
  const router = useRouter() as any;
  const { state } = useFamilyStore();

  const docs = state.documents.filter((doc) => !doc.archived);

  return (
    <FamilyShell
      title="Documents"
      subtitle="Shared files and permissions"
      onBack={() => router.back()}
      headerActions={[
        { icon: 'add', label: 'Upload', onPress: () => router.push('/family/documents/upload') },
        { icon: 'archive-outline', label: 'Archive', onPress: () => router.push('/family/archive') },
      ]}
    >
      <FamilySectionCard title="Shared files" rightLabel="Upload" onRightPress={() => router.push('/family/documents/upload')}>
        {docs.length ? (
          <View style={styles.listWrap}>
            {docs.map((doc) => (
              <ListRow
                key={doc.id}
                icon={doc.docType === 'pdf' ? 'document-outline' : doc.docType === 'image' ? 'image-outline' : 'document-text-outline'}
                label={doc.name}
                body={`${doc.visibility === 'shared' ? 'Shared' : 'Restricted'} · ${doc.aiSummary}`}
                onPress={() => router.push(`/family/documents/${doc.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No documents yet" body="Upload school forms, medical records, and household docs." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="cloud-upload-outline" label="Upload" tone="primary" onPress={() => router.push('/family/documents/upload')} />
          <BubbleChip icon="shield-checkmark-outline" label="Permissions" tone="neutral" onPress={() => router.push('/family/settings')} />
          <BubbleChip icon="sparkles-outline" label="Summarize" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Summarize the school form and share it with parents only.'" onAsk={() => router.push('/family/voice-summary')} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
