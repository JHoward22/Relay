import { Redirect } from 'expo-router';

export default function LegacyBillsHubRedirect() {
  return <Redirect href={'/finances/bills' as any} />;
}
