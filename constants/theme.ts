/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#0a84ff';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#666666',
    background: '#f5f5f5',
    card: '#ffffff',
    border: '#e5e7eb',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    error: '#ff3b30',
    success: '#34c759',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#000000',
    card: '#1c1c1e',
    border: '#38383a',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    error: '#ff453a',
    success: '#32d74b',
  },
};
