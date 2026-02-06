import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { ds } from '@/constants/design-system';

const PRO_FEATURES = [
  'Advanced recurring intelligence',
  'Family and shared task management',
  'Proactive life admin suggestions',
  'Priority automation features (future)',
];

const COMPARISON = {
  Free: ['Core tasks', 'Manual edits', 'Daily planning'],
  Pro: ['Smart automations', 'Shared coordination', 'Proactive suggestions'],
  Family: ['Family roles', 'Assignment boards', 'Shared reminders'],
};

export default function RelayProScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Relay Pro"
          subtitle="Let Relay handle the details, so you don’t have to."
          onBack={() => router.back()}
        />

        <GlassCard blur>
          <SectionTitle title="What you get with Pro" />
          {PRO_FEATURES.map((item) => (
            <View key={item} style={styles.rowWrap}>
              <ListRow icon="sparkles-outline" label={item} variant="compact" />
            </View>
          ))}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Free vs Pro vs Family" />
          <View style={styles.compareRow}>
            {Object.entries(COMPARISON).map(([plan, items]) => (
              <View key={plan} style={[styles.planCard, plan === 'Pro' && styles.planCardFeatured]}>
                <Text style={styles.planTitle}>{plan}</Text>
                {items.map((item) => (
                  <Text key={item} style={styles.planItem}>
                    {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </GlassCard>

        <PrimaryButton label="Upgrade when you’re ready" onPress={() => router.back()} />
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
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  rowWrap: {
    marginBottom: ds.spacing.s4,
  },
  compareRow: {
    gap: ds.spacing.s8,
  },
  planCard: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: ds.colors.bgAlt,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
  },
  planCardFeatured: {
    backgroundColor: ds.colors.primarySoft,
    borderColor: '#D5E1FF',
  },
  planTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
    marginBottom: ds.spacing.s8,
  },
  planItem: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '500',
    color: ds.colors.textMuted,
    marginBottom: ds.spacing.s4,
  },
});
