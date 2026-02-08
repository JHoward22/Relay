import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LegacyHomeFamilyAnnouncementRedirect() {
  const router = useRouter() as any;

  useEffect(() => {
    router.replace('/family/voice-summary');
  }, [router]);

  return null;
}
