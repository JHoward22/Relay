import { Redirect } from 'expo-router';

export default function LegacyMealsCreateRedirect() {
  return <Redirect href={'/meals/add-recipe' as any} />;
}
