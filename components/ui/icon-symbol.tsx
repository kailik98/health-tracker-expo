// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Tab Bar Icons
  'chart.bar.fill': 'bar-chart',
  'plus.circle.fill': 'add-circle',
  'safari.fill': 'explore',
  'star.fill': 'star',
  'clock.fill': 'access-time',
  // Explore Screen
  'heart.fill': 'favorite',
  'exclamationmark.triangle.fill': 'warning',
  // Goals Screen
  'trash.fill': 'delete',
  'minus.circle.fill': 'remove-circle',
  plus: 'add',
  // History & Detail Screen
  'face.smiling': 'mood',
  'cloud.rain.fill': 'cloud',
  'moon.zzz': 'nights-stay',
  'bolt.fill': 'bolt',
  'circle.fill': 'circle',
  'drop.fill': 'water-drop',
  'bed.double.fill': 'bed',
  'figure.walk': 'directions-walk',
  'calendar.badge.exclamationmark': 'event-busy',
  'arrow.up': 'arrow-upward',
  pencil: 'edit',
  'chevron.left': 'chevron-left',
  'checkmark.seal.fill': 'verified',
  target: 'track-changes',
  calendar: 'event',
} as any;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
