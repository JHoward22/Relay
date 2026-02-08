import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacyHomeFamilyPermissionsRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family/settings');
  }, [router]);

  return null;
}
