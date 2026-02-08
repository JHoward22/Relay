import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { ds } from '@/constants/design-system';
import { TaskItem } from '@/store/relay-store';
import { BubbleChip } from './BubbleChip';

type SwipeTaskRowProps = {
  task: TaskItem;
  contextLine: string;
  overdue?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onComplete: () => void;
  onMore: () => void;
};

export function SwipeTaskRow({
  task,
  contextLine,
  overdue = false,
  onPress,
  onLongPress,
  onComplete,
  onMore,
}: SwipeTaskRowProps) {
  const swipeRef = useRef<any>(null);

  const closeAndRun = (action: () => void) => {
    swipeRef.current?.close();
    action();
  };

  return (
    <Animated.View layout={Layout.springify().damping(18)} style={styles.wrap}>
      <Swipeable
        ref={swipeRef}
        overshootRight={false}
        overshootLeft={false}
        friction={1.8}
        leftThreshold={26}
        rightThreshold={26}
        renderLeftActions={() => (
          <View style={styles.swipeActionWrap}>
            <BubbleChip icon="checkmark" label="Complete" tone="success" onPress={() => closeAndRun(onComplete)} />
          </View>
        )}
        renderRightActions={() => (
          <View style={styles.swipeActionWrapRight}>
            <BubbleChip icon="ellipsis-horizontal" label="More" tone="primary" onPress={() => closeAndRun(onMore)} />
          </View>
        )}
      >
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={180}
          style={[styles.row, overdue && styles.overdueRow]}
        >
          <View style={styles.checkboxWrap}>
            <BubbleChip
              icon={task.completed ? 'checkmark' : 'ellipse-outline'}
              tone={task.completed ? 'success' : 'neutral'}
              compact
              onPress={onComplete}
            />
          </View>

          <View style={styles.textWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{task.title}</Text>
              <Ionicons name="sparkles-outline" size={14} color={ds.colors.primary} />
            </View>
            <Text style={styles.context}>{contextLine}</Text>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: ds.spacing.s8,
  },
  row: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  overdueRow: {
    borderColor: 'rgba(225, 190, 130, 0.72)',
    backgroundColor: 'rgba(255, 248, 236, 0.82)',
  },
  checkboxWrap: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ds.spacing.s8,
  },
  title: {
    flex: 1,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '600',
  },
  context: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  swipeActionWrap: {
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: ds.spacing.s8,
  },
  swipeActionWrapRight: {
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: ds.spacing.s8,
  },
});
