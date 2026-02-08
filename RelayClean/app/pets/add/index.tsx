import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { PetsShell, PetsTalkSheet } from '../components/PetsShell';

export default function AddPetScreen() {
  const router = useRouter() as any;
  const [talkOpen, setTalkOpen] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('2');
  const [weightKg, setWeightKg] = useState('5');
  const [photoUri, setPhotoUri] = useState('');

  return (
    <PetsShell title="Add Pet" subtitle="Create a profile" onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="Luna" />
      <FormField label="Species" value={species} onChangeText={setSpecies} placeholder="Dog / Cat" />
      <FormField label="Breed (optional)" value={breed} onChangeText={setBreed} placeholder="Breed" />
      <FormField label="Age (years)" value={ageYears} onChangeText={setAgeYears} placeholder="2" keyboardType="number-pad" />
      <FormField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="5" keyboardType="decimal-pad" />
      <FormField label="Photo URL (optional)" value={photoUri} onChangeText={setPhotoUri} placeholder="https://..." />

      <PrimaryButton
        label="Continue"
        onPress={() =>
          router.push({
            pathname: '/pets/add/confirm',
            params: { name, species, breed, ageYears, weightKg, photoUri },
          })
        }
        style={styles.action}
      />
      <SecondaryButton label="Save by voice" onPress={() => setTalkOpen(true)} />

      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: ds.spacing.s8,
  },
});
