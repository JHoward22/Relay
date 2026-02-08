import { Redirect } from 'expo-router';

export default function LegacyPetsHubRedirect() {
  return <Redirect href={'/pets' as any} />;
}
