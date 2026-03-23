import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol, IconSymbolName } from './icon-symbol';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  action?: {
    icon: IconSymbolName;
    onPress: () => void;
  };
  onBack?: () => void;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  rightElement,
  action,
  onBack,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style, onBack ? { flexDirection: 'column' } : null]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={28} color={theme.text} />
        </TouchableOpacity>
      )}
      <View style={[styles.mainHeaderRow, !onBack && { flexDirection: 'row' }]}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        {(rightElement || action) && (
          <View style={styles.rightContainer}>
            {rightElement ? (
              <View style={styles.rightElement}>{rightElement}</View>
            ) : action ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.tint + '15' }]}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <IconSymbol name={action.icon} size={24} color={theme.tint} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    marginLeft: -8,
    marginBottom: 12,
    padding: 8,
    alignSelf: 'flex-start',
  },
  mainHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    lineHeight: 20,
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  rightElement: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
