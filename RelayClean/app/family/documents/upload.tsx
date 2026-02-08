import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyUploadDocumentScreen() {
  const router = useRouter() as any;
  const { addDocument, state } = useFamilyStore();

  const [name, setName] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'image' | 'text'>('pdf');
  const [tags, setTags] = useState('school');
  const [visibility, setVisibility] = useState<'shared' | 'restricted'>('shared');

  return (
    <FamilyShell title="Upload Document" subtitle="Demo upload flow" onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="School form.pdf" />
        <FormField label="Type (pdf/image/text)" value={docType} onChangeText={(value) => setDocType((value as any) || 'pdf')} />
        <FormField label="Tags" value={tags} onChangeText={setTags} placeholder="school, medical" />
        <FormField label="Visibility (shared/restricted)" value={visibility} onChangeText={(value) => setVisibility((value as any) || 'shared')} />
      </GlassCard>

      <PrimaryButton
        label="Save document"
        onPress={() => {
          const id = addDocument({
            name: name || 'Untitled document',
            docType,
            tagIds: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            visibility,
            allowedMemberIds: state.members.map((member) => member.id),
            aiSummary: 'Relay indexed this document and extracted key points.',
            uploadedByMemberId: state.members[0]?.id ?? 'fm-1',
          });
          router.replace(`/family/documents/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
