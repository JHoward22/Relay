import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';

type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

export function MealsShell({
  title,
  subtitle,
  onBack,
  children,
  headerActions,
  contentStyle,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  headerActions?: HeaderAction[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          rightNode={
            headerActions?.length ? (
              <View style={styles.headerActionRow}>
                {headerActions.slice(0, 3).map((action) => (
                  <Pressable key={action.label} onPress={action.onPress} style={styles.headerActionButton}>
                    <Ionicons name={action.icon} size={16} color={ds.colors.primary} />
                  </Pressable>
                ))}
              </View>
            ) : undefined
          }
        />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function VoiceHintRow({
  label,
  onAsk,
}: {
  label?: string;
  onAsk: () => void;
}) {
  return (
    <GlassCard blur style={styles.voiceHintCard}>
      <View style={styles.voiceHintTop}>
        <Text style={styles.voiceHintTitle}>Ask Relay</Text>
        <Text style={styles.voiceHintLabel}>{label ?? "Try 'Plan dinners for next week'"}</Text>
      </View>
      <BubbleChip icon="mic" label="Open voice" tone="primary" onPress={onAsk} />
    </GlassCard>
  );
}

export function MealsTalkSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return <TalkToRelaySheet visible={open} onClose={onClose} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32 + 80,
    gap: ds.spacing.s12,
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
    ...ds.shadow.soft,
  },
  voiceHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ds.spacing.s12,
  },
  voiceHintTop: {
    flex: 1,
  },
  voiceHintTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.primary,
    fontWeight: '700',
    marginBottom: ds.spacing.s4,
  },
  voiceHintLabel: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
});
