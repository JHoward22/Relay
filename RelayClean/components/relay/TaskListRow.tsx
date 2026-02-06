import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';
import { ds } from '@/constants/design-system';

type TaskListRowProps = {
  title: string;
  dueDate: string;
  completed: boolean;
  onPress: () => void;
  onToggle: () => void;
};

export function TaskListRow({ title, dueDate, completed, onPress, onToggle }: TaskListRowProps) {
  return (
    <Animated.View layout={Layout.springify().damping(18)} style={styles.wrap}>
      <Pressable style={[styles.row, completed && styles.rowDone]} onPress={onPress}>
        <Pressable
          style={[styles.check, completed && styles.checkDone]}
          onPress={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          {completed ? <Text style={styles.tick}>✓</Text> : null}
        </Pressable>

        <View style={styles.textWrap}>
          <Text style={[styles.title, completed && styles.titleDone]}>{title}</Text>
          <Text style={styles.meta}>{dueDate}</Text>
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
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: ds.colors.bgAlt,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s12,
  },
  rowDone: {
    opacity: 0.6,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: ds.colors.secondary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: ds.colors.primary,
    borderColor: ds.colors.primary,
  },
  tick: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 14,
    color: '#FFFFFF',
    fontWeight: '700',
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
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
