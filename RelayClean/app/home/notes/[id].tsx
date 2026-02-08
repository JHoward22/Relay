import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyNoteDetailRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <Redirect href={'/notes' as any} />;
  return <Redirect href={{ pathname: '/notes/note/[id]' as any, params: { id } }} />;
}
