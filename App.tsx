import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './src/components/Card';
import { ScreenContainer } from './src/components/ScreenContainer';
import { colors, spacing, typography } from './src/design-system';

const inboxItems = [
  {
    title: 'Call pediatrician next week',
    context: 'Family',
    due: 'Due Mon',
  },
  {
    title: 'Pick up dry cleaning',
    context: 'Errands',
    due: 'Due Today',
  },
  {
    title: 'Review school form draft',
    context: 'Admin',
    due: 'Due Thu',
  },
];

export default function App() {
  return (
    <ScreenContainer style={styles.container}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Relay Home</Text>
            <Text style={styles.title}>Good morning, Jaiden</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>7 day streak</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Today at a glance</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>3</Text>
              <Text style={styles.metricLabel}>Needs follow-up</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>5</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>2</Text>
              <Text style={styles.metricLabel}>Reminders set</Text>
            </View>
          </View>
        </Card>

        <View style={styles.primaryActionWrap}>
          <Pressable style={styles.micButton} onPress={() => {}}>
            <Ionicons name="mic" size={38} color={colors.surface} />
          </Pressable>
          <Text style={styles.primaryActionLabel}>Talk to Relay</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Inbox</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>

        <View style={styles.inboxStack}>
          {inboxItems.map((item) => (
            <Card key={item.title} style={styles.inboxCard}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.itemMetaRow}>
                <Text style={styles.itemContext}>{item.context}</Text>
                <Text style={styles.itemDue}>{item.due}</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  streakBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  streakText: {
    ...typography.caption,
    color: colors.accent,
  },
  sectionTitle: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    ...typography.headline,
    color: colors.accent,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  primaryActionWrap: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 7,
  },
  primaryActionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionLink: {
    ...typography.caption,
    color: colors.accent,
  },
  inboxStack: {
    gap: spacing.sm,
  },
  inboxCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemDue: {
    ...typography.caption,
    color: colors.warning,
  },
});
