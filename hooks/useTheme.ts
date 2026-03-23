import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/theme';

/**
 * A custom hook to predictably fetch the localized theme object
 * based on the active system color scheme.
 */
export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  return {
    ...Colors[colorScheme],
    isDark: colorScheme === 'dark',
  };
}
