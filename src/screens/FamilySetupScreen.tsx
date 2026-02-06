import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'FamilySetup'>;

export const FamilySetupScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Family setup (optional)</Text>
        <Text style={styles.subtitle}>
          Add the people and pets you coordinate with most. You can edit this
          anytime.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Suggested profiles</Text>
        <View style={styles.pillRow}>
          {['Partner', 'Kids', 'Parents', 'Pets'].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.footer}>
        <AppButton
          label="Add later"
          variant="secondary"
          onPress={() => navigation.navigate('OnboardingComplete')}
        />
        <AppButton
          label="Continue"
          onPress={() => navigation.navigate('OnboardingComplete')}
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
  card: {
    marginBottom: spacing.xl,
  },
  cardTitle: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    backgroundColor: colors.accentSoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  pillText: {
    ...typography.caption,
    color: colors.accent,
  },
  footer: {
    marginTop: 'auto',
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
