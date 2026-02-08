import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell } from '../../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../../pets-context';

export default function VaccinesListScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state } = usePetsStore();

  const pet = getPet(id);
  const vaccines = state.vaccines.filter((item) => item.petId === id);

  return (
    <PetsShell title="Vaccinations" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Vaccine records">
        {vaccines.length ? vaccines.map((vaccine) => (
          <View key={vaccine.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="shield-checkmark-outline"
              label={vaccine.name}
              body={`Due ${formatDateShort(vaccine.dueISO)} • ${vaccine.status}`}
              onPress={() => router.push(`/pets/profile/${id}/health/vaccines/${vaccine.id}`)}
            />
          </View>
        )) : <EmptyState title="No vaccine records" body="Add vaccine history and due dates." />}
      </PetsSectionCard>

      <PrimaryButton label="Add vaccine" onPress={() => router.push(`/pets/profile/${id}/health/vaccines/create`)} />
    </PetsShell>
  );
}
