import { Redirect } from 'expo-router';

export default function LegacyPetCreateReminderRedirect() {
  return <Redirect href={'/pets' as any} />;
}
