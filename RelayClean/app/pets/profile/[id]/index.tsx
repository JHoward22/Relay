import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsSectionCard, PetsShell, PetsTalkSheet, PetsVoiceHint } from '../../components/PetsShell';
import { formatDateShort, speciesLabel, usePetsStore } from '../../pets-context';

export default function PetProfileScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state, getScheduleForPet } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const pet = useMemo(() => getPet(id), [getPet, id]);

  if (!pet || pet.archived) {
    return (
      <PetsShell title="Pet Profile" subtitle="Not found" onBack={() => router.replace('/pets')}>
        <EmptyState title="Pet profile not found" body="This pet may have been archived or removed." />
      </PetsShell>
    );
  }

  const meds = state.medications.filter((item) => item.petId === pet.id);
  const vaccines = state.vaccines.filter((item) => item.petId === pet.id);
  const schedule = getScheduleForPet(pet.id).slice(0, 4);

  return (
    <PetsShell
      title={pet.name}
      subtitle={`${speciesLabel(pet.species)} • ${pet.ageYears} years`}
      onBack={() => router.back()}
      headerActions={[{ icon: 'create-outline', label: 'Edit', onPress: () => router.push(`/pets/profile/${pet.id}/edit`) }]}
    >
      <PetsSectionCard title="Overview" rightLabel="Health" onRightPress={() => router.push(`/pets/profile/${pet.id}/health`)}>
        <View style={styles.overviewTop}>
          <View style={styles.avatar}>
            <Ionicons name="paw" size={22} color={ds.colors.primary} />
          </View>
          <View style={styles.overviewText}>
            <Text style={styles.overviewTitle}>{pet.breed || speciesLabel(pet.species)}</Text>
            <Text style={styles.overviewMeta}>Weight {pet.weightKg} kg</Text>
            <Text style={styles.overviewMeta}>Last vet {formatDateShort(pet.lastVetVisitISO)}</Text>
          </View>
        </View>
      </PetsSectionCard>

      <PetsSectionCard title="Health" rightLabel="Open" onRightPress={() => router.push(`/pets/profile/${pet.id}/health`)}>
        <ListRow
          icon="medkit-outline"
          label="Medications"
          body={`${meds.length} active`}
          onPress={() => router.push(`/pets/profile/${pet.id}/health/medications`)}
        />
        <View style={styles.rowGap} />
        <ListRow
          icon="shield-checkmark-outline"
          label="Vaccinations"
          body={`${vaccines.filter((item) => item.status !== 'complete').length} pending`}
          onPress={() => router.push(`/pets/profile/${pet.id}/health/vaccines`)}
        />
      </PetsSectionCard>

      <PetsSectionCard title="Schedule" rightLabel="View all" onRightPress={() => router.push(`/pets/profile/${pet.id}/schedule`)}>
        {schedule.length ? (
          schedule.map((item) => (
            <View key={item.id} style={styles.rowGap}>
              <ListRow
                icon={item.kind === 'feeding' ? 'restaurant-outline' : item.kind === 'walk' ? 'walk-outline' : item.kind === 'medication' ? 'medkit-outline' : item.kind === 'vaccine' ? 'shield-checkmark-outline' : 'calendar-outline'}
                label={item.title}
                body={`${item.whenLabel} • ${item.statusLabel}`}
                onPress={() => router.push(`/pets/profile/${pet.id}/schedule/item/${item.id}`)}
              />
            </View>
          ))
        ) : (
          <EmptyState title="No schedule yet" body="Add feedings, walks, meds, or vet visits." />
        )}
      </PetsSectionCard>

      <PetsSectionCard title="Actions">
        <View style={styles.primaryActions}>
          <PrimaryButton label="Feeding Log" onPress={() => router.push(`/pets/profile/${pet.id}/feeding`)} style={styles.flex} />
          <SecondaryButton label="Vet Visits" onPress={() => router.push(`/pets/profile/${pet.id}/vet-visits`)} style={styles.flex} />
        </View>
      </PetsSectionCard>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.toolsRow}>
          <BubbleChip icon="walk-outline" label="Walk Log" tone="neutral" onPress={() => router.push(`/pets/profile/${pet.id}/walks`)} />
          <BubbleChip icon="document-text-outline" label="Notes" tone="neutral" onPress={() => router.push(`/pets/profile/${pet.id}/notes`)} />
          <BubbleChip icon="archive-outline" label="Archive Pet" tone="danger" onPress={() => router.push(`/pets/profile/${pet.id}/archive`)} />
          <BubbleChip icon="mic-outline" label="Ask Relay" tone="neutral" onPress={() => setTalkOpen(true)} />
        </View>
      </GlassCard>

      <PetsVoiceHint label="Try saying: 'Schedule a vet visit next Tuesday at 3 PM'" onAsk={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  overviewTop: {
    flexDirection: 'row',
    gap: ds.spacing.s12,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42,134,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(95,160,255,0.42)',
  },
  overviewText: {
    flex: 1,
  },
  overviewTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  overviewMeta: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rowGap: {
    marginBottom: ds.spacing.s8,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: ds.spacing.s8,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
