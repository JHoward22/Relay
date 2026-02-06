import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function NotificationSettingsScreen() {
  const router = useRouter() as any;
  const { state, updateNotificationSettings } = useRelayStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Notifications" subtitle="Gentle timing and quiet hours" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Nudges" />
          <ListRow
            variant="compact"
            label="Gentle nudges"
            trailing={
              <Switch
                value={state.notificationSettings.nudgeEnabled}
                onValueChange={(value) => updateNotificationSettings({ nudgeEnabled: value })}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={state.notificationSettings.nudgeEnabled ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
          <FormField
            label="Daily recap time"
            value={state.notificationSettings.recapTime}
            onChangeText={(value) => updateNotificationSettings({ recapTime: value })}
          />
          <ListRow
            variant="compact"
            label="Quiet hours"
            trailing={
              <Switch
                value={state.notificationSettings.quietHours}
                onValueChange={(value) => updateNotificationSettings({ quietHours: value })}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={state.notificationSettings.quietHours ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
