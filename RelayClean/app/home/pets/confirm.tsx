import { Redirect } from 'expo-router';

export default function LegacyPetConfirmRedirect() {
  return <Redirect href={'/pets' as any} />;
}
