import { Redirect } from 'expo-router';

export default function LegacyMealsHubRedirect() {
  return <Redirect href={'/meals' as any} />;
}
