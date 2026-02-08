import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SwipeInboxRow } from '@/components/relay/SwipeInboxRow';
import { ds } from '@/constants/design-system';
import { InboxFilter, useRelayStore } from '@/store/relay-store';

const FILTERS: InboxFilter[] = ['today', 'waiting', 'upcoming'];

export default function HomeInboxScreen() {
  const router = useRouter() as any;
  const { state, markInboxDone, snoozeInbox } = useRelayStore();
  const [filter, setFilter] = useState<InboxFilter>('today');

  const items = useMemo(
    () => state.inbox.filter((item) => !item.done && item.filter === filter),
    [filter, state.inbox]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Life Inbox"
          subtitle="All items"
          onBack={() => router.back()}
          rightLabel="Add"
          onRightPress={() => router.push('/home/create')}
        />

        <View style={styles.chipRow}>
          {FILTERS.map((chip) => {
            const selected = chip === filter;
            return (
              <Pressable
                key={chip}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setFilter(chip)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{chip}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listWrap}>
          {items.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <SwipeInboxRow
                icon={
                  item.type === 'event'
                    ? 'calendar-outline'
                    : item.type === 'message'
                      ? 'mail-outline'
                      : item.type === 'recurring'
                        ? 'repeat-outline'
                        : item.type === 'reminder'
                          ? 'alarm-outline'
                          : 'checkmark-done-outline'
                }
                label={item.title}
                body={item.subtitle}
                onPress={() => router.push(`/home/item/${item.id}`)}
                onDone={() => markInboxDone(item.id)}
                onSnooze={() => snoozeInbox(item.id)}
              />
            </View>
          ))}
          {!items.length ? <Text style={styles.empty}>No items in this filter.</Text> : null}
        </View>
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
  },
  chipRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s12,
  },
  chip: {
    borderRadius: ds.radius.pill,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  chipSelected: {
    backgroundColor: ds.colors.primary,
    borderColor: ds.colors.primary,
  },
  chipText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: ds.colors.textSoft,
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  empty: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: ds.colors.textMuted,
  },
});
