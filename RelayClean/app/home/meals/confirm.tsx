import { Redirect } from 'expo-router';

export default function LegacyMealsConfirmRedirect() {
  return <Redirect href={'/meals/plan-generator/confirm' as any} />;
}
