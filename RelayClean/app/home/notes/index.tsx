import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyNotesHubRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/notes' as any, params }} />;
}
