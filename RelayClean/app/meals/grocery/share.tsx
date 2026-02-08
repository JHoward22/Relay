import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { MealsShell } from '../components/MealsShell';

export default function ShareGroceryListScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  };

  return (
    <MealsShell title="Share Grocery List" subtitle="Family mode" onBack={() => router.back()}>
      <View style={styles.list}>
        {state.members.map((member) => (
          <ListRow
            key={member.id}
            icon="person-circle-outline"
            label={member.name}
            body={member.role}
            trailing={
              <BubbleChip
                icon={selected.includes(member.id) ? 'checkmark' : 'ellipse-outline'}
                label=""
                tone={selected.includes(member.id) ? 'success' : 'neutral'}
                onPress={() => toggle(member.id)}
              />
            }
          />
        ))}
      </View>

      <PrimaryButton label="Share now" onPress={() => router.replace('/meals/grocery')} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: ds.spacing.s8,
  },
});
