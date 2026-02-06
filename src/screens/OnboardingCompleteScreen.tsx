import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';

export const OnboardingCompleteScreen = () => (
  <ScreenContainer>
    <View style={styles.header}>
      <Text style={styles.title}>You are ready for Relay</Text>
      <Text style={styles.subtitle}>
        Your life inbox is prepared. When you are ready, start speaking and
        Relay will handle the rest.
      </Text>
    </View>

    <Card style={styles.card}>
      <Text style={styles.cardTitle}>What happens next</Text>
      <Text style={styles.cardBody}>
        You will see a calm inbox with space for daily life. The microphone will
        appear at the bottom once you enter.
      </Text>
    </Card>

    <View style={styles.footer}>
      <AppButton label="Enter Relay" onPress={() => {}} />
    </View>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.xxl,
  },
  cardTitle: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
  },
});
