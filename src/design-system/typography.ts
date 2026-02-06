import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'SF Pro Display',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600' as const,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  subheadline: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
};
