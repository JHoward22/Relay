import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ListRow } from './ListRow';

export function IconRow({
  icon,
  tint,
  label,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint?: string;
  label: string;
  body?: string;
  onPress?: () => void;
}) {
  return <ListRow icon={icon} iconTint={tint} label={label} body={body} onPress={onPress} variant="card" />;
}
