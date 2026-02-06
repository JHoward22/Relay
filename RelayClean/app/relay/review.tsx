import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { RelayDraftItem, useRelayStore } from '@/store/relay-store';

function safeParseDraft(raw?: string | string[]): RelayDraftItem[] {
  if (!raw) return [];
  const value = Array.isArray(raw) ? raw[0] : raw;
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded) as RelayDraftItem[];
  } catch {
    return [];
  }
}

function destination(type: RelayDraftItem['type']) {
  if (type === 'event') return 'Calendar';
  if (type === 'message') return 'Life Inbox';
  return 'Tasks';
}

export default function RelayReviewScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ draft?: string }>();
  const { addFromRelay } = useRelayStore();

  const initialDraft = useMemo(() => safeParseDraft(params.draft), [params.draft]);
  const [items, setItems] = useState<RelayDraftItem[]>(initialDraft);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Review" subtitle="Confirm each item before saving" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Relay understood these items" />
          {items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <FormField
                label="Title"
                value={item.title}
                onChangeText={(value) =>
                  setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, title: value } : entry)))
                }
              />
              <View style={styles.metaRow}>
                <FormField
                  label="When"
                  value={item.dueLabel}
                  onChangeText={(value) =>
                    setItems((prev) =>
                      prev.map((entry) => (entry.id === item.id ? { ...entry, dueLabel: value } : entry))
                    )
                  }
                  containerStyle={styles.flex}
                />
                <FormField
                  label="Type"
                  value={item.type}
                  onChangeText={(value) =>
                    setItems((prev) =>
                      prev.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              type:
                                value === 'event' || value === 'message' || value === 'reminder' || value === 'task'
                                  ? value
                                  : entry.type,
                            }
                          : entry
                      )
                    )
                  }
                  autoCapitalize="none"
                  containerStyle={styles.typeField}
                />
              </View>
              <ListRow variant="compact" label="Destination" rightText={destination(item.type)} />
            </View>
          ))}
        </GlassCard>

        <PrimaryButton
          label="Confirm and Add"
          onPress={() => {
            addFromRelay(items);
            router.replace('/(tabs)');
          }}
        />
        <SecondaryButton label="Back" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.surface,
    backgroundColor: '#FFFFFF',
    padding: ds.spacing.s12,
    marginBottom: ds.spacing.s8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  typeField: {
    width: 120,
  },
});
