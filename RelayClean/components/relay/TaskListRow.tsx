import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { ds } from '@/constants/design-system';
import { BubbleChip } from './BubbleChip';

type TaskListRowProps = {
  title: string;
  dueDate: string;
  completed: boolean;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  onPress: () => void;
  onToggle: () => void;
};

export function TaskListRow({
  title,
  dueDate,
  completed,
  assignee,
  priority = 'medium',
  onPress,
  onToggle,
}: TaskListRowProps) {
  const priorityColor =
    priority === 'high' ? '#EA7474' : priority === 'low' ? '#6AB88E' : '#F2A74A';

  return (
    <Animated.View layout={Layout.springify().damping(18)} style={styles.wrap}>
      <Pressable style={[styles.row, completed && styles.rowDone]} onPress={onPress}>
        <View style={styles.checkWrap}>
          <BubbleChip
            icon={completed ? 'checkmark' : 'ellipse-outline'}
            tone={completed ? 'success' : 'neutral'}
            compact
            onPress={onToggle}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, completed && styles.titleDone]}>{title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{dueDate}</Text>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            {assignee ? <Text style={styles.assignee}>{assignee}</Text> : null}
          </View>
        </View>
      </Pressable>
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
  rowDone: {
    opacity: 0.6,
  },
  checkWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  meta: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  metaRow: {
    marginTop: ds.spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  assignee: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: '#7090C6',
    fontWeight: '600',
  },
});
