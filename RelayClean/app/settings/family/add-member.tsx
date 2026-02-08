import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacySettingsFamilyAddMemberRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family/members/invite');
  }, [router]);

  return null;
}
