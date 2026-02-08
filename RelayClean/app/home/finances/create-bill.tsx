import { Redirect } from 'expo-router';

export default function LegacyCreateBillRedirect() {
  return <Redirect href={'/finances/bills/create' as any} />;
}
