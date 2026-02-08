import { Redirect } from 'expo-router';

export default function LegacyPetRoutineRedirect() {
  return <Redirect href={'/pets' as any} />;
}
