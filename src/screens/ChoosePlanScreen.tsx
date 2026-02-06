import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'ChoosePlan'>;

export const ChoosePlanScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>
          Start with the essentials and upgrade whenever it feels right.
        </Text>
      </View>

      <View style={styles.stack}>
        <Card style={styles.planCard}>
          <Text style={styles.planTitle}>Relay Essential</Text>
          <Text style={styles.planPrice}>Free</Text>
          <Text style={styles.planBody}>
            Voice capture, manual edits, and calm reminders.
          </Text>
        </Card>
        <Card style={styles.planCard}>
          <Text style={styles.planTitle}>Relay Plus</Text>
          <Text style={styles.planPrice}>$8 / month</Text>
          <Text style={styles.planBody}>
            Smart suggestions, shared lists, and deeper summaries.
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Continue with Essential"
          onPress={() => navigation.navigate('FamilySetup')}
        />
        <AppButton
          label="Try Relay Plus"
          variant="secondary"
          onPress={() => navigation.navigate('FamilySetup')}
          style={styles.secondaryButton}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
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
  stack: {
    gap: spacing.md,
  },
  planCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  planTitle: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planPrice: {
    ...typography.bodyBold,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  planBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
