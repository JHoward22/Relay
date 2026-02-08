import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell } from '../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../pets-context';

export default function WalkLogScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state, logWalk } = usePetsStore();

  const pet = getPet(id);
  const walks = state.walks.filter((item) => item.petId === id);

  return (
    <PetsShell title="Walk Log" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Walk schedule">
        {walks.length ? walks.map((walk) => (
          <View key={walk.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="walk-outline"
              label={walk.title}
              body={`${formatDateShort(walk.dateISO)} ${walk.timeLabel} • ${walk.durationMin} min`}
              rightText={walk.completed ? 'Done' : 'Planned'}
              onPress={() => router.push(`/pets/profile/${id}/walks/${walk.id}/edit`)}
              trailing={<PrimaryButton label={walk.completed ? 'Logged' : 'Log'} onPress={() => logWalk(walk.id)} style={{ minWidth: 84 }} />}
            />
          </View>
        )) : <EmptyState title="No walk plan" body="Add walk routines and durations." />}
      </PetsSectionCard>

      <PrimaryButton label="Log walk" onPress={() => router.push(`/pets/profile/${id}/walks/create`)} />
    </PetsShell>
  );
}
