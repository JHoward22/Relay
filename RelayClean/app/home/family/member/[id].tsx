import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacyHomeFamilyMemberRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family/members');
  }, [router]);

  return null;
}
