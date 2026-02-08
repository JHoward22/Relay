import { Redirect } from 'expo-router';

export default function LegacyFinancesConfirmRedirect() {
  return <Redirect href={'/finances/add/confirm' as any} />;
}
