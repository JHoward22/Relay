import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Ionicons } from '@expo/vector-icons';
import { ds } from '@/constants/design-system';
import { ListRow } from './ListRow';
import { BubbleChip } from './BubbleChip';

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
          <BubbleChip icon="checkmark" label="Done" tone="success" onPress={() => closeAndRun(onDone)} />
          <BubbleChip icon="time-outline" label="Later" tone="primary" onPress={() => closeAndRun(onSnooze)} />
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
    alignItems: 'center',
  },
});
