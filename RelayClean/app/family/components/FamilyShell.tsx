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

export function FamilyShell({
  title,
  subtitle,
  onBack,
  headerActions,
  children,
  contentStyle,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  headerActions?: HeaderAction[];
  children: React.ReactNode;
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
              <View style={styles.headerActions}>
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

export function FamilySectionCard({
  title,
  rightLabel,
  onRightPress,
  children,
}: {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <GlassCard blur style={styles.sectionCard}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {rightLabel ? (
          <Pressable onPress={onRightPress}>
            <Text style={styles.sectionRight}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </GlassCard>
  );
}

export function FamilyVoiceHint({
  label,
  onAsk,
}: {
  label: string;
  onAsk: () => void;
}) {
  return (
    <GlassCard blur style={styles.voiceCard}>
      <View style={styles.voiceTextWrap}>
        <Text style={styles.voiceTitle}>Voice-first</Text>
        <Text style={styles.voiceBody}>{label}</Text>
      </View>
      <BubbleChip icon="mic" label="Ask Relay" tone="primary" onPress={onAsk} />
    </GlassCard>
  );
}

export function FamilyTalkSheet({
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
    paddingBottom: ds.spacing.s32 + 84,
    gap: ds.spacing.s12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: ds.radius.r12,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
    ...ds.shadow.soft,
  },
  sectionCard: {
    gap: ds.spacing.s8,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ds.spacing.s4,
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sectionRight: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  voiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: ds.spacing.s12,
  },
  voiceTextWrap: {
    flex: 1,
  },
  voiceTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.primary,
    fontWeight: '700',
    marginBottom: ds.spacing.s4,
  },
  voiceBody: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
});
