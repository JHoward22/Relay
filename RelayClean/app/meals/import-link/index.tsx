import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';
import { defaultImportDraft, useMealsStore } from '../meals-context';

export default function ImportLinkScreen() {
  const router = useRouter() as any;
  const { state, setImportDraft } = useMealsStore();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [talkOpen, setTalkOpen] = useState(false);

  const submit = (link: string) => {
    const candidate = link.trim();
    if (!candidate || !candidate.includes('.')) {
      setError("We couldn't read that link.");
      return;
    }
    setError('');
    const draft = defaultImportDraft(candidate.startsWith('http') ? candidate : `https://${candidate}`);
    setImportDraft(draft);
    router.push({ pathname: '/meals/import-link/preview', params: { url: draft.url } });
  };

  return (
    <MealsShell title="Import Recipe Link" subtitle="Capture recipes from social links" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.label}>Paste recipe link</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor="#8A95AD"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </GlassCard>

      <PrimaryButton label="Import" onPress={() => submit(url)} />
      <SecondaryButton label="Save as bookmark anyway" onPress={() => {
        if (!url.trim()) return;
        const draft = defaultImportDraft(url.trim());
        setImportDraft(draft);
        router.push({ pathname: '/meals/import-link/success', params: { url: draft.url } });
      }} />

      <GlassCard blur>
        <Text style={styles.sectionTitle}>Recent imports</Text>
        {state.recentImports.length ? (
          <View style={styles.recentList}>
            {state.recentImports.map((entry) => (
              <ListRow
                key={entry.url}
                icon="link-outline"
                label={entry.title}
                body={entry.source}
                onPress={() => submit(entry.url)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No recent imports" body="Paste a link to get started." />
        )}
      </GlassCard>

      <VoiceHintRow label="Say 'Import this recipe link'" onAsk={() => setTalkOpen(true)} />

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s8,
  },
  label: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  input: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    color: ds.colors.text,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
  },
  error: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: '#C04D4D',
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  recentList: {
    gap: ds.spacing.s8,
  },
});
