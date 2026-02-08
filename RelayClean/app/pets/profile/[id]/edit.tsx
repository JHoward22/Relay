import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../components/PetsShell';
import { speciesLabel, usePetsStore } from '../../pets-context';

export default function EditPetScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, updatePet } = usePetsStore();

  const pet = useMemo(() => getPet(id), [getPet, id]);
  const [name, setName] = useState(pet?.name ?? '');
  const [species, setSpecies] = useState(pet ? speciesLabel(pet.species) : 'Dog');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [ageYears, setAgeYears] = useState(String(pet?.ageYears ?? 0));
  const [weightKg, setWeightKg] = useState(String(pet?.weightKg ?? 0));

  if (!pet) {
    return (
      <PetsShell title="Edit Pet" subtitle="Not found" onBack={() => router.replace('/pets')}>
        <EmptyState title="Pet not found" body="Return to Pets and choose another profile." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Pet" subtitle={pet.name} onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} />
      <FormField label="Species" value={species} onChangeText={setSpecies} />
      <FormField label="Breed" value={breed} onChangeText={setBreed} />
      <FormField label="Age (years)" value={ageYears} onChangeText={setAgeYears} keyboardType="number-pad" />
      <FormField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />

      <PrimaryButton
        label="Save changes"
        onPress={() => {
          updatePet(pet.id, {
            name: name.trim() || pet.name,
            species: species.toLowerCase() === 'cat' ? 'cat' : species.toLowerCase() === 'bird' ? 'bird' : species.toLowerCase() === 'other' ? 'other' : 'dog',
            breed: breed.trim() || undefined,
            ageYears: Number(ageYears || pet.ageYears),
            weightKg: Number(weightKg || pet.weightKg),
          });
          router.replace(`/pets/profile/${pet.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
