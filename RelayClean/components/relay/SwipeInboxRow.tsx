import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { ds } from '@/constants/design-system';
import { ListRow } from './ListRow';

type SwipeInboxRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  body?: string;
  onPress: () => void;
  onDone: () => void;
  onSnooze: () => void;
};

export function SwipeInboxRow({ icon, label, body, onPress, onDone, onSnooze }: SwipeInboxRowProps) {
  const swipeRef = useRef<any>(null);

  const closeAndRun = (action: () => void) => {
    swipeRef.current?.close();
    action();
  };

  return (
    <Swipeable
      ref={swipeRef}
      overshootRight={false}
      friction={1.9}
      rightThreshold={32}
      renderRightActions={() => (
        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, styles.doneButton]} onPress={() => closeAndRun(onDone)}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Done</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.snoozeButton]}
            onPress={() => closeAndRun(onSnooze)}
          >
            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Later</Text>
          </Pressable>
        </View>
      )}
    >
      <ListRow icon={icon} label={label} body={body} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginLeft: ds.spacing.s8,
  },
  actionButton: {
    width: 76,
    borderRadius: ds.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds.spacing.s4,
    ...ds.shadow.soft,
  },
  doneButton: {
    backgroundColor: ds.colors.success,
  },
  snoozeButton: {
    backgroundColor: ds.colors.primary,
  },
  actionText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
