import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { PetsSectionCard, PetsShell } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function PetScheduleScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, getScheduleForPet } = usePetsStore();

  const pet = getPet(id);
  const schedule = useMemo(() => getScheduleForPet(id), [getScheduleForPet, id]);
  const [filter, setFilter] = useState<'all' | 'feeding' | 'walk' | 'medication' | 'vaccine' | 'vet-visit'>('all');
  const [pickerOpen, setPickerOpen] = useState(false);

  const filtered = schedule.filter((item) => (filter === 'all' ? true : item.kind === filter));

  return (
    <PetsShell title="Schedule" subtitle={pet?.name ?? 'Pet timeline'} onBack={() => router.back()}>
      <PetsSectionCard title="Filters">
        <View style={styles.filters}>
          {(['all', 'feeding', 'walk', 'medication', 'vaccine', 'vet-visit'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={filter === entry ? 'checkmark' : 'funnel-outline'}
              label={entry === 'all' ? 'All' : entry}
              tone={filter === entry ? 'primary' : 'neutral'}
              onPress={() => setFilter(entry)}
            />
          ))}
        </View>
      </PetsSectionCard>

      <PetsSectionCard title="Timeline" rightLabel="Add item" onRightPress={() => setPickerOpen(true)}>
        {filtered.length ? filtered.map((item) => (
          <View key={item.id} style={styles.rowWrap}>
            <ListRow
              icon={item.kind === 'feeding' ? 'restaurant-outline' : item.kind === 'walk' ? 'walk-outline' : item.kind === 'medication' ? 'medkit-outline' : item.kind === 'vaccine' ? 'shield-checkmark-outline' : 'calendar-outline'}
              label={item.title}
              body={`${item.whenLabel} • ${item.statusLabel}`}
              onPress={() => router.push(`/pets/profile/${id}/schedule/item/${item.id}`)}
            />
          </View>
        )) : <EmptyState title="No schedule items" body="Add feeding, walk, medication, vaccine, or vet visit." />}
      </PetsSectionCard>

      <SheetModal visible={pickerOpen} onClose={() => setPickerOpen(false)}>
        <View style={styles.sheetActions}>
          <BubbleChip icon="restaurant-outline" label="Feeding" tone="primary" onPress={() => { setPickerOpen(false); router.push(`/pets/profile/${id}/feeding/create`); }} />
          <BubbleChip icon="walk-outline" label="Walk" tone="primary" onPress={() => { setPickerOpen(false); router.push(`/pets/profile/${id}/walks/create`); }} />
          <BubbleChip icon="medkit-outline" label="Medication" tone="primary" onPress={() => { setPickerOpen(false); router.push(`/pets/profile/${id}/health/medications/create`); }} />
          <BubbleChip icon="shield-checkmark-outline" label="Vaccine" tone="primary" onPress={() => { setPickerOpen(false); router.push(`/pets/profile/${id}/health/vaccines/create`); }} />
          <BubbleChip icon="calendar-outline" label="Vet visit" tone="primary" onPress={() => { setPickerOpen(false); router.push(`/pets/profile/${id}/vet-visits/create`); }} />
          <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setPickerOpen(false)} />
        </View>
      </SheetModal>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
