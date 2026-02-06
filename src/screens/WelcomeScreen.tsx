import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Relay</Text>
        <Text style={styles.subtitle}>
          A calm, voice-first way to keep life moving without the noise.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Designed for everyday life</Text>
        <Text style={styles.cardBody}>
          Relay listens, organizes, and helps you follow through—while you stay
          present.
        </Text>
      </Card>

      <View style={styles.footer}>
        <AppButton
          label="Continue"
          onPress={() => navigation.navigate('VoiceFirstIntro')}
        />
        <Text style={styles.caption}>No account needed to get started.</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
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
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
