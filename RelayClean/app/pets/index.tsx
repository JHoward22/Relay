import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { PetsSectionCard, PetsShell, PetsTalkSheet, PetsVoiceHint } from './components/PetsShell';
import { formatDateShort, speciesLabel, usePetsStore } from './pets-context';

export default function PetsHomeScreen() {
  const router = useRouter() as any;
  const { state: relayState } = useRelayStore();
  const { activePets, state, insights, dismissInsight } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [selectedPetId, setSelectedPetId] = useState(activePets[0]?.id ?? '');

  const selectedPet = useMemo(
    () => activePets.find((pet) => pet.id === selectedPetId) ?? activePets[0],
    [activePets, selectedPetId]
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayFeedings = state.feedings.filter((item) => item.petId === selectedPet?.id && item.dateISO === todayISO);
  const todayWalks = state.walks.filter((item) => item.petId === selectedPet?.id && item.dateISO === todayISO);
  const upcomingMeds = state.medications.filter((item) => item.petId === selectedPet?.id).slice(0, 1);
  const nextVisit = state.vetVisits.find((item) => item.petId === selectedPet?.id && item.status === 'upcoming');

  const topInsight = insights[0] ?? null;

  if (!activePets.length) {
    return (
      <PetsShell title="Pets" subtitle="Care center">
        <GlassCard blur>
          <EmptyState title="No pets yet" body="Add your first pet profile to track care and appointments." />
          <View style={styles.emptyActions}>
            <PrimaryButton label="Add your first pet" onPress={() => router.push('/pets/add')} />
            <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
          </View>
        </GlassCard>

        <PetsVoiceHint label="Try saying: set up pet care reminders" onAsk={() => setTalkOpen(true)} />
        <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
      </PetsShell>
    );
  }

  return (
    <PetsShell
      title="Pets"
      subtitle={`${selectedPet?.name ?? 'Pet'} • care overview`}
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/pets/add') },
        { icon: 'mic-outline', label: 'Ask', onPress: () => setTalkOpen(true) },
      ]}
    >
      <PetsSectionCard title="Care Today" rightLabel="Open profile" onRightPress={() => router.push(`/pets/profile/${selectedPet?.id}`)}>
        <View style={styles.petPickerRow}>
          {activePets.map((pet) => {
            const active = selectedPet?.id === pet.id;
            return (
              <Pressable
                key={pet.id}
                style={[styles.petChip, active && styles.petChipActive]}
                onPress={() => setSelectedPetId(pet.id)}
              >
                <Text style={[styles.petChipName, active && styles.petChipNameActive]}>{pet.name}</Text>
                <Text style={[styles.petChipMeta, active && styles.petChipMetaActive]}>{speciesLabel(pet.species)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rowStack}>
          {todayFeedings.slice(0, 1).map((feeding) => (
            <ListRow
              key={feeding.id}
              icon="restaurant-outline"
              label={feeding.title}
              body={`${feeding.timeLabel} · ${feeding.foodType}`}
              rightText={feeding.completed ? 'Done' : 'Due'}
              onPress={() => router.push(`/pets/profile/${selectedPet?.id}/feeding`)}
            />
          ))}

          {todayWalks.slice(0, 1).map((walk) => (
            <ListRow
              key={walk.id}
              icon="walk-outline"
              label={walk.title}
              body={`${walk.timeLabel} · ${walk.durationMin} min`}
              rightText={walk.completed ? 'Done' : 'Planned'}
              onPress={() => router.push(`/pets/profile/${selectedPet?.id}/walks`)}
            />
          ))}

          {upcomingMeds.map((medication) => (
            <ListRow
              key={medication.id}
              icon="medkit-outline"
              label={medication.name}
              body={`Due ${formatDateShort(medication.nextDueISO)} · ${medication.timeLabel}`}
              onPress={() => router.push(`/pets/profile/${selectedPet?.id}/health/medications/${medication.id}`)}
            />
          ))}

          {nextVisit ? (
            <ListRow
              icon="calendar-outline"
              label="Vet appointment"
              body={`${formatDateShort(nextVisit.dateISO)} · ${nextVisit.timeLabel}`}
              onPress={() => router.push(`/pets/profile/${selectedPet?.id}/vet-visits/${nextVisit.id}`)}
            />
          ) : null}

          {!todayFeedings.length && !todayWalks.length && !upcomingMeds.length && !nextVisit ? (
            <EmptyState title="No pet actions due" body="You're clear for now. Relay can add the next routine." />
          ) : null}
        </View>

        <View style={styles.primaryActions}>
          <PrimaryButton label="Log Care" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/feeding/create`)} style={styles.flex} />
          <SecondaryButton label="Schedule Visit" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/vet-visits/create`)} style={styles.flex} />
        </View>
      </PetsSectionCard>

      <PetsSectionCard title="Health Snapshot" rightLabel="View health" onRightPress={() => router.push(`/pets/profile/${selectedPet?.id}/health`)}>
        <Text style={styles.snapshotPrimary}>Weight {selectedPet?.weightKg ?? '--'} kg</Text>
        <Text style={styles.snapshotSecondary}>
          Last vet {formatDateShort(selectedPet?.lastVetVisitISO ?? todayISO)} · Next vaccine {formatDateShort(selectedPet?.nextVaccinationISO ?? todayISO)}
        </Text>
        <Text style={styles.snapshotAi}>{selectedPet?.status === 'attention' ? 'Relay flagged one overdue item.' : 'Everything looks on track.'}</Text>
      </PetsSectionCard>

      {topInsight ? (
        <GlassCard blur>
          <Text style={styles.insightEyebrow}>Top Insight</Text>
          <Text style={styles.insightTitle}>{topInsight.title}</Text>
          <Text style={styles.insightBody}>{topInsight.body}</Text>
          <View style={styles.chipsRow}>
            <BubbleChip icon="open-outline" label="Open" tone="success" onPress={() => router.push(topInsight.actionRoute)} />
            <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={() => dismissInsight(topInsight.id)} />
          </View>
        </GlassCard>
      ) : null}

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.chipsRow}>
          <BubbleChip icon="book-outline" label="Notes" tone="neutral" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/notes`)} />
          <BubbleChip icon="calendar-outline" label="Schedule" tone="neutral" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/schedule`)} />
          <BubbleChip icon="time-outline" label="Vet Visits" tone="neutral" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/vet-visits`)} />
          {relayState.familyModeEnabled ? (
            <BubbleChip icon="people-outline" label="Caretakers" tone="neutral" onPress={() => router.push(`/pets/profile/${selectedPet?.id}/caretakers`)} />
          ) : null}
        </View>
      </GlassCard>

      <PetsVoiceHint label="Try saying: did I give meds today?" onAsk={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  emptyActions: {
    marginTop: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  petPickerRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s12,
  },
  petChip: {
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
    alignItems: 'center',
  },
  petChipActive: {
    borderColor: 'rgba(86, 154, 255, 0.48)',
    backgroundColor: 'rgba(78, 145, 255, 0.16)',
  },
  petChipName: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.text,
    fontWeight: '700',
  },
  petChipNameActive: {
    color: ds.colors.primary,
  },
  petChipMeta: {
    marginTop: 1,
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  petChipMetaActive: {
    color: ds.colors.textSoft,
  },
  rowStack: {
    gap: ds.spacing.s8,
  },
  primaryActions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  snapshotPrimary: {
    fontFamily: ds.font,
    fontSize: 18,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  snapshotSecondary: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  snapshotAi: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  insightEyebrow: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  insightTitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 21,
    color: ds.colors.text,
    fontWeight: '700',
  },
  insightBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
