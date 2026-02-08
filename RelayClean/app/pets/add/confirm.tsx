import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../components/PetsShell';
import { usePetsStore } from '../pets-context';

export default function AddPetConfirmScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{
    name?: string;
    species?: string;
    breed?: string;
    ageYears?: string;
    weightKg?: string;
    photoUri?: string;
  }>();
  const { addPet } = usePetsStore();

  const name = (params.name || 'New pet').trim();
  const speciesRaw = (params.species || 'dog').toLowerCase();
  const species: 'dog' | 'cat' | 'bird' | 'other' =
    speciesRaw === 'cat' ? 'cat' : speciesRaw === 'bird' ? 'bird' : speciesRaw === 'other' ? 'other' : 'dog';

  return (
    <PetsShell title="Confirm Pet" subtitle="Relay understood this" onBack={() => router.back()}>
      <GlassCard blur>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Species</Text>
          <Text style={styles.value}>{params.species || 'Dog'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Breed</Text>
          <Text style={styles.value}>{params.breed || 'Not set'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{params.ageYears || '0'} years</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{params.weightKg || '0'} kg</Text>
        </View>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            const id = addPet({
              name,
              species,
              breed: params.breed || undefined,
              ageYears: Number(params.ageYears || 0),
              weightKg: Number(params.weightKg || 0),
              photoUri: params.photoUri || undefined,
              familyShared: true,
              caretakerIds: ['ct-1'],
              lastVetVisitISO: undefined,
              nextVaccinationISO: undefined,
            });
            router.replace({ pathname: '/pets/add/success', params: { id } });
          }}
        />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.back()} />
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.replace('/pets')} />
      </View>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ds.spacing.s8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(190,208,236,0.35)',
  },
  label: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  value: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
