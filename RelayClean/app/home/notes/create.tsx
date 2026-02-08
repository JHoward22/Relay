import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyNotesCreateRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/notes/create' as any, params }} />;
}
