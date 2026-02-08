import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell } from '../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../pets-context';

export default function FeedingLogScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state, logFeeding } = usePetsStore();

  const pet = getPet(id);
  const feedings = state.feedings.filter((item) => item.petId === id);

  return (
    <PetsShell title="Feeding Log" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Feeding schedule">
        {feedings.length ? feedings.map((feeding) => (
          <View key={feeding.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="restaurant-outline"
              label={feeding.title}
              body={`${formatDateShort(feeding.dateISO)} ${feeding.timeLabel} • ${feeding.portion}`}
              rightText={feeding.completed ? 'Done' : 'Due'}
              onPress={() => router.push(`/pets/profile/${id}/feeding/${feeding.id}/edit`)}
              trailing={
                <PrimaryButton
                  label={feeding.completed ? 'Logged' : 'Log'}
                  onPress={() => logFeeding(feeding.id)}
                  style={{ minWidth: 84 }}
                />
              }
            />
          </View>
        )) : <EmptyState title="No feedings yet" body="Add feeding schedule for this pet." />}
      </PetsSectionCard>

      <PrimaryButton label="Log feeding" onPress={() => router.push(`/pets/profile/${id}/feeding/create`)} />
    </PetsShell>
  );
}
