import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacySettingsFamilyAssignmentsRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family/tasks');
  }, [router]);

  return null;
}
