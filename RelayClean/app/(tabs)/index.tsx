import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '@/components/relay/AppHeader';
import { BottomMicBar } from '@/components/relay/BottomMicBar';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { SwipeInboxRow } from '@/components/relay/SwipeInboxRow';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function formatDate() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
}

function iconForType(type: string) {
  if (type === 'event') return 'calendar-outline';
  if (type === 'message') return 'mail-outline';
  if (type === 'recurring') return 'repeat-outline';
  if (type === 'reminder') return 'alarm-outline';
  return 'checkmark-done-outline';
}

export default function HomeScreen() {
  const router = useRouter() as any;
  const [relayOpen, setRelayOpen] = useState(false);
  const { state, markInboxDone, snoozeInbox } = useRelayStore();

  const openItems = useMemo(() => state.inbox.filter((item) => !item.done), [state.inbox]);
  const lifeInbox = useMemo(() => openItems.slice(0, 4), [openItems]);
  const firstOpen = openItems[0];

  const summary = useMemo(() => {
    const todayCount = openItems.filter((item) => item.filter === 'today').length;
    const waitingCount = openItems.filter((item) => item.filter === 'waiting').length;
    const upcomingCount = openItems.filter((item) => item.filter === 'upcoming').length;
    return [
      { label: 'Today', value: todayCount },
      { label: 'Waiting', value: waitingCount },
      { label: 'Upcoming', value: upcomingCount },
    ];
  }, [openItems]);

  const suggestions = useMemo(
    () => [
      'Ask Relay to draft your follow-up messages.',
      'Group tasks by family member with one prompt.',
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Good morning, Jaiden"
          subtitle={formatDate()}
          rightLabel="Add"
          onRightPress={() => router.push('/home/create')}
        />

        <GlassCard>
          <SectionTitle title="Today at a glance" />
          <View style={styles.summaryRow}>
            {summary.map((item) => (
              <View key={item.label} style={styles.summaryPill}>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard>
          <SectionTitle
            title="Life Inbox"
            rightLabel="View all"
            onRightPress={() => router.push('/home/inbox')}
          />
          {lifeInbox.length ? (
            lifeInbox.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 35).duration(200)}
                style={styles.rowWrap}
              >
                <SwipeInboxRow
                  icon={iconForType(item.type)}
                  label={item.title}
                  body={item.subtitle}
                  onPress={() => router.push(`/home/item/${item.id}`)}
                  onDone={() => markInboxDone(item.id)}
                  onSnooze={() => snoozeInbox(item.id)}
                />
              </Animated.View>
            ))
          ) : (
            <EmptyState title="You're all caught up." body="Talk to Relay when something new comes up." />
          )}
        </GlassCard>

        <GlassCard blur>
          <SectionTitle title="Suggested" />
          {suggestions.map((tip) => (
            <View key={tip} style={styles.rowWrap}>
              <ListRow icon="sparkles-outline" label={tip} onPress={() => setRelayOpen(true)} />
            </View>
          ))}
          <Text style={styles.hint}>Relay is keeping an eye on your day.</Text>
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomMicBar
        onMicPress={() => setRelayOpen(true)}
        onDone={() => {
          if (firstOpen) markInboxDone(firstOpen.id);
        }}
        onLater={() => {
          if (firstOpen) snoozeInbox(firstOpen.id);
        }}
        onViewAll={() => router.push('/home/inbox')}
      />

      <TalkToRelaySheet visible={relayOpen} onClose={() => setRelayOpen(false)} />
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
    paddingBottom: 270,
    gap: ds.spacing.s12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  summaryPill: {
    flex: 1,
    borderRadius: ds.radius.card,
    backgroundColor: ds.colors.cardSoft,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingVertical: ds.spacing.s12,
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: ds.font,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '600',
    color: ds.colors.primary,
  },
  summaryLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '500',
    color: ds.colors.textMuted,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  hint: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '500',
    color: ds.colors.textMuted,
  },
  bottomSpacer: {
    height: ds.spacing.s16,
  },
});
