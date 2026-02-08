import { Redirect } from 'expo-router';

export default function LegacyMealsGroceryRedirect() {
  return <Redirect href={'/meals/grocery' as any} />;
}
