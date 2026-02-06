import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'Permissions'>;

export const PermissionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>A quick permissions check</Text>
        <Text style={styles.subtitle}>
          Relay only asks for what it needs to listen and remind you. You can
          adjust everything later.
        </Text>
      </View>

      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Microphone access</Text>
          <Text style={styles.cardBody}>
            Used to capture voice notes after onboarding. Always optional.
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.cardBody}>
            Gentle reminders for important follow-through moments.
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Allow and continue"
          onPress={() => navigation.navigate('ChoosePlan')}
        />
        <AppButton
          label="Not now"
          variant="ghost"
          onPress={() => navigation.navigate('ChoosePlan')}
          style={styles.secondaryButton}
        />
      </View>
    </ScreenContainer>
  );
};

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
  stack: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.subheadline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardBody: {
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
