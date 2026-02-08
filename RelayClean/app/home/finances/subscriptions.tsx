import { Redirect } from 'expo-router';

export default function LegacySubscriptionsHubRedirect() {
  return <Redirect href={'/finances/subscriptions' as any} />;
}
