import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../../components/PetsShell';
import { usePetsStore } from '../../pets-context';

export default function PetCaretakersScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state, setCaretakerPermission } = usePetsStore();

  const pet = getPet(id);
  if (!pet) {
    return (
      <PetsShell title="Caretakers" subtitle="Not found" onBack={() => router.replace('/pets')}>
        <EmptyState title="Pet not found" body="Return to Pets home." />
      </PetsShell>
    );
  }

  const assigned = state.caretakers.filter((item) => pet.caretakerIds.includes(item.id));

  return (
    <PetsShell title="Caretakers" subtitle={`${pet.name} sharing`} onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>Who fed the pet? Who gives meds?</Text>
        <Text style={styles.body}>Set permission levels for shared care and accountability.</Text>
      </GlassCard>

      {assigned.map((caretaker) => (
        <View key={caretaker.id} style={styles.rowWrap}>
          <ListRow
            icon="person-outline"
            label={caretaker.name}
            body={`${caretaker.role} • ${caretaker.permission === 'edit' ? 'Can edit' : 'View only'}`}
            trailing={
              <View style={styles.permissionWrap}>
                <Pressable
                  style={[styles.permissionChip, caretaker.permission === 'view' ? styles.permissionChipActive : null]}
                  onPress={() => setCaretakerPermission(caretaker.id, 'view')}
                >
                  <Ionicons name="eye-outline" size={13} color={caretaker.permission === 'view' ? '#FFFFFF' : ds.colors.textMuted} />
                  <Text style={[styles.permissionText, caretaker.permission === 'view' ? styles.permissionTextActive : null]}>View</Text>
                </Pressable>
                <Pressable
                  style={[styles.permissionChip, caretaker.permission === 'edit' ? styles.permissionChipActive : null]}
                  onPress={() => setCaretakerPermission(caretaker.id, 'edit')}
                >
                  <Ionicons name="create-outline" size={13} color={caretaker.permission === 'edit' ? '#FFFFFF' : ds.colors.textMuted} />
                  <Text style={[styles.permissionText, caretaker.permission === 'edit' ? styles.permissionTextActive : null]}>Edit</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ))}
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s4,
  },
  body: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  permissionWrap: {
    flexDirection: 'row',
    gap: ds.spacing.s4,
  },
  permissionChip: {
    borderRadius: ds.radius.pill,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.68)',
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  permissionChipActive: {
    borderColor: 'rgba(78, 149, 255, 0.45)',
    backgroundColor: ds.colors.primary,
  },
  permissionText: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  permissionTextActive: {
    color: '#FFFFFF',
  },
});
