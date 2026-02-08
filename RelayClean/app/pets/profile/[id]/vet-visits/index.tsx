import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell } from '../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../pets-context';

export default function VetVisitsScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state } = usePetsStore();

  const pet = getPet(id);
  const visits = state.vetVisits.filter((item) => item.petId === id);

  return (
    <PetsShell title="Vet Visits" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Appointments">
        {visits.length ? visits.map((visit) => (
          <View key={visit.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="calendar-outline"
              label={visit.reason}
              body={`${formatDateShort(visit.dateISO)} ${visit.timeLabel} • ${visit.clinicName}`}
              rightText={visit.status}
              onPress={() => router.push(`/pets/profile/${id}/vet-visits/${visit.id}`)}
            />
          </View>
        )) : <EmptyState title="No vet visits" body="Schedule your first vet visit." />}
      </PetsSectionCard>

      <PrimaryButton label="Schedule visit" onPress={() => router.push(`/pets/profile/${id}/vet-visits/create`)} />
    </PetsShell>
  );
}
