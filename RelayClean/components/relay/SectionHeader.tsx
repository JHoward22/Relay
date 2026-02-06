import React from 'react';
import { SectionTitle } from './SectionTitle';

export function SectionHeader(props: { title: string; rightLabel?: string; onRightPress?: () => void }) {
  return <SectionTitle {...props} />;
}
