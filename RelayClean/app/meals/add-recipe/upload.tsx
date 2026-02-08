import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';

export default function RecipePhotoUploadScreen() {
  const router = useRouter() as any;
  const [uploaded, setUploaded] = useState(false);

  return (
    <MealsShell title="Upload Photo" subtitle="Capture recipe card or screenshot" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Photo import (demo)</Text>
        <Text style={styles.body}>No OCR connection yet. This flow stages images now and will support auto-parsing in a later phase.</Text>

        <View style={styles.actions}>
          <BubbleChip icon="image-outline" label="Select photo" tone="primary" onPress={() => setUploaded(true)} />
          <BubbleChip icon="camera-outline" label="Take photo" tone="neutral" onPress={() => setUploaded(true)} />
        </View>

        {uploaded ? <Text style={styles.success}>Photo staged. Continue to manual review.</Text> : null}
      </GlassCard>

      <PrimaryButton label="Continue" onPress={() => router.push('/meals/add-recipe/manual')} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: ds.spacing.s12 },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  success: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.success,
    fontWeight: '700',
  },
});
