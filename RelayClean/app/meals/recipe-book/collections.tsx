import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListRow } from '@/components/relay/ListRow';
import { MealsShell } from '../components/MealsShell';
import { useMealsStore } from '../meals-context';
import { ds } from '@/constants/design-system';

export default function RecipeCollectionsScreen() {
  const router = useRouter() as any;
  const { state } = useMealsStore();

  return (
    <MealsShell title="Collections" subtitle="Organized recipe sets" onBack={() => router.back()}>
      <View style={styles.list}>
        {state.collections.map((collection) => {
          const count = state.recipes.filter((recipe) => recipe.collections.includes(collection)).length;
          return (
            <ListRow
              key={collection}
              icon="albums-outline"
              label={collection}
              body={`${count} recipes`}
              onPress={() => router.push(`/meals/recipe-book?collection=${encodeURIComponent(collection)}`)}
            />
          );
        })}
      </View>
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: ds.spacing.s8,
  },
});
