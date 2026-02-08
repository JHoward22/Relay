import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { PetsSectionCard, PetsShell, PetsTalkSheet, PetsVoiceHint } from '../../../components/PetsShell';
import { formatDateShort, usePetsStore } from '../../../pets-context';

export default function PetHealthOverviewScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const pet = useMemo(() => getPet(id), [getPet, id]);

  if (!pet) {
    return (
      <PetsShell title="Health" subtitle="Not found" onBack={() => router.replace('/pets')}>
        <EmptyState title="Pet not found" body="Return to Pets home." />
      </PetsShell>
    );
  }

  const medications = state.medications.filter((item) => item.petId === pet.id);
  const vaccines = state.vaccines.filter((item) => item.petId === pet.id);
  const visits = state.vetVisits.filter((item) => item.petId === pet.id);

  return (
    <PetsShell title="Health" subtitle={`${pet.name} overview`} onBack={() => router.back()}>
      <PetsSectionCard title="Snapshot">
        <Text style={styles.primary}>Weight {pet.weightKg} kg</Text>
        <Text style={styles.meta}>Last visit {formatDateShort(pet.lastVetVisitISO)} · Next vaccine {formatDateShort(pet.nextVaccinationISO)}</Text>
      </PetsSectionCard>

      <PetsSectionCard title="Vaccinations" rightLabel="All" onRightPress={() => router.push(`/pets/profile/${pet.id}/health/vaccines`)}>
        {vaccines.length ? vaccines.slice(0, 3).map((vaccine) => (
          <View key={vaccine.id} style={styles.rowWrap}>
            <ListRow
              icon="shield-checkmark-outline"
              label={vaccine.name}
              body={`Due ${formatDateShort(vaccine.dueISO)} • ${vaccine.status}`}
              onPress={() => router.push(`/pets/profile/${pet.id}/health/vaccines/${vaccine.id}`)}
            />
          </View>
        )) : <EmptyState title="No vaccines yet" body="Add your first vaccine record." />}
      </PetsSectionCard>

      <PetsSectionCard title="Medications" rightLabel="All" onRightPress={() => router.push(`/pets/profile/${pet.id}/health/medications`)}>
        {medications.length ? medications.slice(0, 3).map((medication) => (
          <View key={medication.id} style={styles.rowWrap}>
            <ListRow
              icon="medkit-outline"
              label={medication.name}
              body={`Next ${formatDateShort(medication.nextDueISO)} • ${medication.dosage}`}
              onPress={() => router.push(`/pets/profile/${pet.id}/health/medications/${medication.id}`)}
            />
          </View>
        )) : <EmptyState title="No medications" body="Track medications and dosage schedule here." />}
      </PetsSectionCard>

      <PetsSectionCard title="Vet History" rightLabel="View" onRightPress={() => router.push(`/pets/profile/${pet.id}/vet-visits`)}>
        {visits.length ? visits.slice(0, 3).map((visit) => (
          <View key={visit.id} style={styles.rowWrap}>
            <ListRow
              icon="calendar-outline"
              label={visit.reason}
              body={`${formatDateShort(visit.dateISO)} • ${visit.clinicName}`}
              onPress={() => router.push(`/pets/profile/${pet.id}/vet-visits/${visit.id}`)}
            />
          </View>
        )) : <EmptyState title="No vet visits yet" body="Schedule a vet visit to start history." />}
      </PetsSectionCard>

      <PrimaryButton label="Add medication" onPress={() => router.push(`/pets/profile/${pet.id}/health/medications/create`)} />
      <PrimaryButton label="Add vaccine" onPress={() => router.push(`/pets/profile/${pet.id}/health/vaccines/create`)} />
      <PrimaryButton label="Add vet visit" onPress={() => router.push(`/pets/profile/${pet.id}/vet-visits/create`)} />

      <PetsVoiceHint label="Try saying: 'Is Luna overdue for shots?'" onAsk={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  primary: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  meta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
});
