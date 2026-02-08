import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={16} color="#4A84F1" />
        </View>
        <View>
          <Text style={styles.rowTitle}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={15} color={ds.colors.secondary} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter() as any;
  const { state, setFamilyMode } = useRelayStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Settings</Text>
          <Pressable style={styles.headerIcon} onPress={() => router.push('/settings/profile')}>
            <Ionicons name="settings-outline" size={15} color={ds.colors.textSoft} />
          </Pressable>
        </View>

        <GlassCard blur>
          <View style={styles.familyToggleRow}>
            <View>
              <Text style={styles.familyToggleTitle}>Family mode</Text>
              <Text style={styles.familyToggleSub}>Enable shared household views and assignments</Text>
            </View>
            <Switch
              value={state.familyModeEnabled}
              onValueChange={setFamilyMode}
              trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
              thumbColor={state.familyModeEnabled ? ds.colors.primary : '#FFFFFF'}
            />
          </View>

          <SettingsRow
            icon="people-outline"
            title="Family Hub"
            subtitle={state.members.map((member) => member.name).slice(0, 2).join(' · ')}
            onPress={() => router.push('/family')}
          />
          <SettingsRow
            icon="link-outline"
            title="App Connections"
            subtitle="Calendar"
            onPress={() => router.push('/settings/connections/calendar')}
          />
          <SettingsRow
            icon="mail-outline"
            title="Email"
            subtitle="Follow-up syncing"
            value="Connect"
            onPress={() => router.push('/settings/connections/email')}
          />
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            title="Messages"
            subtitle="Future integration"
            value="Connect"
            onPress={() => router.push('/settings/connections/messages')}
          />
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsRow
            icon="sparkles-outline"
            title="AI Memory & Insights"
            subtitle="What Relay remembers and why suggestions appear"
            onPress={() => router.push('/ai/memory')}
          />
          <SettingsRow
            icon="card-outline"
            title="Plan & Billing"
            value="Pro"
            onPress={() => router.push('/pro')}
          />
          <SettingsRow
            icon="help-circle-outline"
            title="Help & About"
            onPress={() => router.push('/modal')}
          />
        </GlassCard>

        <Pressable style={styles.upgradeCard} onPress={() => router.push('/pro')}>
          <Text style={styles.upgradeTitle}>Upgrade to Family Mode</Text>
          <Text style={styles.upgradeBody}>
            Keep your team aligned with shared tasks, schedules, and reminders.
          </Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: 122,
    gap: ds.spacing.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 30,
  },
  headerTitle: {
    fontFamily: ds.font,
    fontSize: 32 * 0.66,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    minHeight: 56,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ds.spacing.s12,
    marginBottom: ds.spacing.s8,
  },
  familyToggleRow: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    marginBottom: ds.spacing.s8,
  },
  familyToggleTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '600',
  },
  familyToggleSub: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  rowIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(70, 125, 238, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontFamily: ds.font,
    fontSize: 17,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '600',
  },
  rowSubtitle: {
    marginTop: 1,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  rowValue: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  upgradeCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
  },
  upgradeTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '600',
  },
  upgradeBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.86,
  },
  bottomSpacer: {
    height: ds.spacing.s24,
  },
});
