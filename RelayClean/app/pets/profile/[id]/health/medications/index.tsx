import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell } from '../../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../../pets-context';

export default function MedicationsListScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state } = usePetsStore();

  const pet = getPet(id);
  const medications = state.medications.filter((item) => item.petId === id);

  return (
    <PetsShell title="Medications" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Active medications">
        {medications.length ? medications.map((medication) => (
          <View key={medication.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="medkit-outline"
              label={medication.name}
              body={`${medication.dosage} • Next ${formatDateShort(medication.nextDueISO)} ${medication.timeLabel}`}
              onPress={() => router.push(`/pets/profile/${id}/health/medications/${medication.id}`)}
            />
          </View>
        )) : <EmptyState title="No medications" body="Add medication details and reminders." />}
      </PetsSectionCard>

      <PrimaryButton label="Add medication" onPress={() => router.push(`/pets/profile/${id}/health/medications/create`)} />
    </PetsShell>
  );
}
