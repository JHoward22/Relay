import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { ds } from '@/constants/design-system';

type FormFieldProps = {
  label: string;
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

export function FormField({ label, multiline, containerStyle, ...inputProps }: FormFieldProps) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        style={[styles.input, multiline && styles.noteInput, inputProps.style]}
        placeholderTextColor="#8B97B0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: ds.spacing.s8,
  },
  label: {
    marginBottom: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '600',
    color: ds.colors.textMuted,
  },
  input: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
  },
  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
