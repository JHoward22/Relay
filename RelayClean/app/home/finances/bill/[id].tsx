import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyBillDetailRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <Redirect href={'/finances/bills' as any} />;
  return <Redirect href={{ pathname: '/finances/bills/[id]' as any, params: { id } }} />;
}
