import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

type LibraryTile = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
};

function LibraryCard({
  item,
  onPress,
}: {
  item: LibraryTile;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tilePress, pressed && styles.tilePressed]}>
      <GlassCard blur style={styles.tile}>
        <View style={[styles.tileIconWrap, { backgroundColor: `${item.tint}21` }]}>
          <Ionicons name={item.icon} size={20} color={item.tint} />
        </View>
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle}>{item.title}</Text>
          <Text style={styles.tileSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={ds.colors.secondary} />
      </GlassCard>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();

  const tiles: LibraryTile[] = [
    {
      id: 'meals',
      title: 'Meals & Recipes',
      subtitle: 'Plan weekly meals and keep grocery lists ready',
      route: '/meals',
      icon: 'restaurant-outline',
      tint: '#D48A47',
    },
    {
      id: 'shopping',
      title: 'Shopping Lists',
      subtitle: 'Capture items fast and check off together',
      route: '/meals/grocery',
      icon: 'cart-outline',
      tint: '#29A384',
    },
    {
      id: 'notes',
      title: 'Notes & Docs',
      subtitle: 'Capture thoughts quickly and retrieve them instantly',
      route: '/notes',
      icon: 'document-text-outline',
      tint: '#4D6FB7',
    },
    {
      id: 'pets',
      title: 'Pets',
      subtitle: 'Track care routines and health appointments',
      route: '/pets',
      icon: 'paw-outline',
      tint: '#57A27D',
    },
    {
      id: 'finances',
      title: 'Finances',
      subtitle: 'Understand your month and stay ahead of obligations',
      route: '/finances',
      icon: 'wallet-outline',
      tint: '#7C8BC8',
    },
    {
      id: 'contacts',
      title: 'Contacts',
      subtitle: 'Reach support and key helpers quickly',
      route: '/help/contact',
      icon: 'call-outline',
      tint: '#4A86F7',
    },
    {
      id: 'family',
      title: 'Family Hub',
      subtitle: state.familyModeEnabled
        ? `${state.members.length} members · shared planning active`
        : 'Optional shared household mode',
      route: '/family',
      icon: 'people-outline',
      tint: '#5D83D5',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard blur style={styles.headerCard}>
          <Text style={styles.headerTitle}>Library</Text>
          <Text style={styles.headerSubtitle}>
            Every Relay capability stays here, organized as one calm AI-first command center.
          </Text>
        </GlassCard>

        <View style={styles.grid}>
          {tiles.map((item) => (
            <LibraryCard key={item.id} item={item} onPress={() => router.push(item.route)} />
          ))}
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
    paddingBottom: 220,
    gap: ds.spacing.s12,
  },
  headerCard: {
    gap: ds.spacing.s8,
  },
  headerTitle: {
    fontFamily: ds.font,
    fontSize: 30,
    lineHeight: 36,
    color: ds.colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 21,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  grid: {
    gap: ds.spacing.s8,
  },
  tilePress: {
    borderRadius: ds.radius.r16,
  },
  tilePressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  tile: {
    borderRadius: ds.radius.r16,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s12,
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBody: {
    flex: 1,
    gap: 2,
  },
  tileTitle: {
    fontFamily: ds.font,
    fontSize: 18,
    lineHeight: 23,
    color: ds.colors.text,
    fontWeight: '700',
  },
  tileSubtitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
