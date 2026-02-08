import { createBox, createText, createTheme } from '@shopify/restyle';

export const relayTheme = createTheme({
  colors: {
    bg: '#F5F8FE',
    bgAlt: '#FBFCFF',
    card: '#FFFFFF',
    cardSoft: '#EEF3FC',
    text: '#1A2742',
    textMuted: '#66749A',
    textSoft: '#425273',
    border: '#DDE6F5',
    primary: '#2E7EF7',
    primarySoft: '#EAF2FF',
    secondary: '#8B97B1',
    success: '#2B8A64',
    health: '#2F8B6A',
    family: '#5476C4',
    reminder: '#B07A2D',
    warning: '#B07A2D',
    overlay: 'rgba(12, 20, 40, 0.35)',
    white: '#FFFFFF',
  },
  spacing: {
    s4: 4,
    s8: 8,
    s12: 12,
    s16: 16,
    s24: 24,
    s32: 32,
  },
  borderRadii: {
    card: 12,
    surface: 16,
    mic: 24,
    pill: 999,
  },
  textVariants: {
    defaults: {
      fontFamily: 'System',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
      color: 'text',
    },
    header: {
      fontFamily: 'System',
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '600',
      color: 'text',
    },
    section: {
      fontFamily: 'System',
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600',
      color: 'text',
    },
    body: {
      fontFamily: 'System',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400',
      color: 'textSoft',
    },
    caption: {
      fontFamily: 'System',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      color: 'textMuted',
    },
  },
});

export type RelayTheme = typeof relayTheme;
export const RelayBox = createBox<RelayTheme>();
export const RelayText = createText<RelayTheme>();
