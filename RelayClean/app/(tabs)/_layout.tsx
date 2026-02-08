import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { FloatingMicButton } from '@/components/relay/FloatingMicButton';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: ds.colors.primary,
          tabBarInactiveTintColor: ds.colors.secondary,
          tabBarStyle: {
            position: 'absolute',
            left: ds.spacing.s8,
            right: ds.spacing.s8,
            bottom: ds.spacing.s8 + insets.bottom * 0.25,
            borderRadius: 32,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: ds.colors.glassBorder,
            backgroundColor: 'rgba(249,252,255,0.9)',
            height: 82 + insets.bottom,
            paddingTop: ds.spacing.s8,
            paddingBottom: ds.spacing.s8 + insets.bottom,
            ...ds.shadow.card,
          },
          tabBarItemStyle: {
            paddingTop: 2,
          },
          tabBarBackground: () => <BlurView tint="light" intensity={30} style={StyleSheet.absoluteFill} />,
          tabBarLabelStyle: {
            fontFamily: ds.font,
            fontSize: 12,
            lineHeight: 16,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="checkbox" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="grid" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Ionicons size={22} name="settings" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <FloatingMicButton onPress={() => setTalkOpen(true)} bottom={insets.bottom + 94} />
      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
});
