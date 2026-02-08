import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyNotesUploadRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/notes/upload' as any, params }} />;
}
