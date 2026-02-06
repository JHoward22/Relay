import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../design-system';
import { OnboardingStackParamList } from '../navigation/OnboardingNavigator';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'VoiceFirstIntro'>;

export const VoiceFirstIntroScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Voice-first, always optional</Text>
        <Text style={styles.title}>Speak your day into place</Text>
        <Text style={styles.subtitle}>
          Relay turns voice notes into organized, gentle nudges—no setup
          required.
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>How Relay helps</Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Capture moments the second they pop up.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Group your life into calm, simple cards.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Stay in control with instant manual edits.</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <AppButton
          label="Continue"
          onPress={() => navigation.navigate('Permissions')}
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
  eyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
  },
});
