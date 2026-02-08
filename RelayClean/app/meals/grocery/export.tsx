import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';

export default function ExportGroceryListScreen() {
  const router = useRouter() as any;
  const [format, setFormat] = useState<'pdf' | 'text' | 'email'>('pdf');

  return (
    <MealsShell title="Export Grocery" subtitle="Placeholder output flow" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Export format</Text>
        <View style={styles.row}>
          <BubbleChip icon="document-outline" label="PDF" tone={format === 'pdf' ? 'primary' : 'neutral'} onPress={() => setFormat('pdf')} />
          <BubbleChip icon="list-outline" label="Text" tone={format === 'text' ? 'primary' : 'neutral'} onPress={() => setFormat('text')} />
          <BubbleChip icon="mail-outline" label="Email" tone={format === 'email' ? 'primary' : 'neutral'} onPress={() => setFormat('email')} />
        </View>
      </GlassCard>

      <PrimaryButton label="Export" onPress={() => router.replace('/meals/grocery')} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s12,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
