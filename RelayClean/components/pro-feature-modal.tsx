import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ds } from '@/constants/design-system';
import { PrimaryButton, SecondaryButton } from './relay/Buttons';
import { SheetModal } from './relay/SheetModal';

type ProFeatureModalProps = {
  visible: boolean;
  onClose: () => void;
  onSeePro: () => void;
};

export function ProFeatureModal({ visible, onClose, onSeePro }: ProFeatureModalProps) {
  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>This is a Relay Pro feature</Text>
        <Text style={styles.body}>
          Pro features are designed for deeper automation, so Relay can save more time and mental
          energy.
        </Text>

        <View style={styles.buttonRow}>
          <SecondaryButton label="Not now" onPress={onClose} style={styles.flex} />
          <PrimaryButton label="See Relay Pro" onPress={onSeePro} style={styles.flex} />
        </View>
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
    gap: ds.spacing.s16,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textSoft,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
});
