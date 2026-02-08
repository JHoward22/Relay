import { Redirect } from 'expo-router';

export default function LegacyFinancesHubRedirect() {
  return <Redirect href={'/finances' as any} />;
}
