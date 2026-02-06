import React from 'react';
import { ListRow } from './ListRow';

export function SettingsRow({
  label,
  body,
  onPress,
}: {
  label: string;
  body?: string;
  onPress?: () => void;
}) {
  return <ListRow label={label} body={body} onPress={onPress} variant="compact" />;
}
