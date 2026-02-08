import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacySubscriptionDetailRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <Redirect href={'/finances/subscriptions' as any} />;
  return <Redirect href={{ pathname: '/finances/subscriptions/[id]' as any, params: { id } }} />;
}
