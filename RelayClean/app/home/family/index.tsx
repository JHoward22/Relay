import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacyHomeFamilyRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family');
  }, [router]);

  return null;
}
