import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyMealDetailRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href={'/meals' as any} />;
  }

  return <Redirect href={{ pathname: '/meals/recipe/[id]' as any, params: { id } }} />;
}
