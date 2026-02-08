import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SecondaryButton } from '@/components/relay/Buttons';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

type PriorityTone = 'overdue' | 'event' | 'grocery';

type PriorityItem = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: PriorityTone;
};

function toneStyles(tone: PriorityTone) {
  if (tone === 'overdue') {
    return {
      border: 'rgba(246, 201, 185, 0.95)',
      glow: '#EE8D5D',
      icon: '#F27A3B',
    };
  }
  if (tone === 'grocery') {
    return {
      border: 'rgba(178, 229, 203, 0.95)',
      glow: '#4BBF8A',
      icon: '#31B077',
    };
  }
  return {
    border: 'rgba(173, 210, 247, 0.95)',
    glow: '#468FEF',
    icon: '#3D87F1',
  };
}

function PriorityCard({
  item,
  onPress,
}: {
  item: PriorityItem;
  onPress: () => void;
}) {
  const tone = toneStyles(item.tone);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.priorityPress, pressed && styles.priorityPressed]}>
      <GlassCard blur style={[styles.priorityCard, { borderColor: tone.border }]}>
        <LinearGradient
          colors={[`${tone.glow}CC`, 'rgba(255,255,255,0.14)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.priorityGlow}
        />
        <View style={[styles.priorityIcon, { backgroundColor: tone.icon }]}>
          <Ionicons name={item.icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.priorityTextWrap}>
          <Text style={styles.priorityTitle}>{item.title}</Text>
          <Text style={styles.prioritySubtitle}>{item.subtitle}</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();

  const todayISO = new Date().toISOString().slice(0, 10);
  const openTasks = useMemo(
    () => state.tasks.filter((task) => !task.completed && !task.archived),
    [state.tasks]
  );
  const todayEvents = useMemo(
    () => state.events.filter((event) => event.date === todayISO),
    [state.events, todayISO]
  );

  const overdueTask =
    openTasks.find((task) => /yesterday|overdue/i.test(task.dueDate)) ?? openTasks[0];
  const featuredEvent = todayEvents[0] ?? state.events[0];
  const summaryText = `Today: ${openTasks.length} tasks • ${todayEvents.length} event${todayEvents.length === 1 ? '' : 's'} • Dinner planned.`;

  const priorities: PriorityItem[] = [
    {
      id: 'overdue',
      title: `Overdue: ${overdueTask?.title ?? 'Finish Report'}`,
      subtitle: overdueTask?.dueDate ?? 'Due Yesterday',
      route: overdueTask ? `/tasks/${overdueTask.id}` : '/tasks',
      icon: 'checkmark',
      tone: 'overdue',
    },
    {
      id: 'event',
      title: featuredEvent?.title ?? 'Doctor Appointment',
      subtitle: featuredEvent ? `${featuredEvent.date} at ${featuredEvent.time}` : 'Today at 3:30 PM',
      route: featuredEvent ? `/calendar/event/${featuredEvent.id}` : '/calendar',
      icon: 'calendar',
      tone: 'event',
    },
    {
      id: 'grocery',
      title: 'Low on Groceries',
      subtitle: 'Add items to your list',
      route: '/meals/grocery',
      icon: 'cart',
      tone: 'grocery',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard blur style={styles.shell}>
          <View style={styles.topRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/settings/profile')}>
              <Ionicons name="person-circle" size={32} color="#8CAAE0" />
            </Pressable>
            <Text style={styles.brand}>Relay</Text>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/settings/notifications')}>
              <Ionicons name="notifications" size={27} color="#8CAAE0" />
            </Pressable>
          </View>

          <View style={styles.greetingWrap}>
            <Text style={styles.greeting}>Good Morning, Sarah.</Text>
            <Text style={styles.summary}>{summaryText}</Text>
          </View>

        <View style={styles.summaryButtons}>
            <SecondaryButton
              label="Summarize Day"
              onPress={() => router.push('/home/summary/result?range=today&type=both')}
              style={styles.summaryButton}
            />
            <SecondaryButton
              label="Summarize Week"
              onPress={() => router.push('/home/summary/result?range=week&type=both')}
              style={styles.summaryButton}
            />
          </View>

          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionTitle}>Priorities for You</Text>
          </View>
          <View style={styles.priorityList}>
            {priorities.map((item) => (
              <PriorityCard key={item.id} item={item} onPress={() => router.push(item.route)} />
            ))}
          </View>
        </GlassCard>
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: ds.spacing.s8,
    paddingTop: ds.spacing.s12,
    paddingBottom: 250,
  },
  shell: {
    borderRadius: 40,
    borderColor: 'rgba(185, 205, 236, 0.85)',
    backgroundColor: 'rgba(248, 251, 255, 0.82)',
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s16,
    paddingBottom: ds.spacing.s16,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(213, 226, 246, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: ds.font,
    fontSize: 48,
    lineHeight: 54,
    color: '#405B91',
    fontWeight: '700',
    letterSpacing: -1,
  },
  greetingWrap: {
    marginTop: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  greeting: {
    fontFamily: ds.font,
    fontSize: 38,
    lineHeight: 42,
    color: '#425B8D',
    fontWeight: '600',
  },
  summary: {
    fontFamily: ds.font,
    fontSize: 18,
    lineHeight: 24,
    color: '#4E679B',
    fontWeight: '500',
  },
  summaryButtons: {
    marginTop: ds.spacing.s16,
    flexDirection: 'row',
    gap: ds.spacing.s12,
  },
  summaryButton: {
    flex: 1,
  },
  sectionHeaderWrap: {
    marginTop: ds.spacing.s24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 210, 236, 0.7)',
    paddingTop: ds.spacing.s12,
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: 22 * 0.9,
    lineHeight: 24,
    color: '#436091',
    fontWeight: '700',
  },
  priorityList: {
    marginTop: ds.spacing.s8,
    gap: ds.spacing.s8,
  },
  priorityPress: {
    borderRadius: ds.radius.r18,
  },
  priorityPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.992 }],
  },
  priorityCard: {
    minHeight: 100,
    borderRadius: ds.radius.r18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ds.spacing.s12,
    overflow: 'hidden',
  },
  priorityGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  priorityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  priorityTextWrap: {
    flex: 1,
    gap: 2,
  },
  priorityTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 25,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  prioritySubtitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.94)',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 32,
  },
});
