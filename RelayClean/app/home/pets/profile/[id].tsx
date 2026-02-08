import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyPetProfileRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <Redirect href={'/pets' as any} />;
  return <Redirect href={{ pathname: '/pets/profile/[id]' as any, params: { id } }} />;
}
