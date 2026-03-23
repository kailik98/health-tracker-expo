import React, { useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from './icon-symbol';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ModalAction {
  label: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  actions?: ModalAction[];
  children?: React.ReactNode; // For custom forms like in Goals
}

export function CustomModal({
  visible,
  onClose,
  title,
  message,
  icon = 'checkmark.seal.fill',
  iconColor,
  actions,
  children,
}: CustomModalProps) {
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                entering={ZoomIn.springify().damping(15)}
                exiting={ZoomOut.duration(150)}
                style={[styles.modalCard, { backgroundColor: theme.card }]}
              >
                <View style={styles.iconContainer}>
                  <IconSymbol name={icon as any} size={48} color={iconColor || theme.tint} />
                </View>

                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

                {children && <View style={styles.customContent}>{children}</View>}

                <View style={styles.actionsContainer}>
                  {actions ? (
                    actions.map((action, index) => {
                      const isDestructive = action.style === 'destructive';
                      const isPrimary = action.style === 'primary' || !action.style;

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.actionButton,
                            isPrimary && { backgroundColor: theme.tint },
                            isDestructive && { backgroundColor: theme.error + '20' },
                            !isPrimary &&
                              !isDestructive && { borderWidth: 1, borderColor: theme.border },
                          ]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            action.onPress();
                          }}
                        >
                          <Text
                            style={[
                              styles.actionText,
                              isPrimary && { color: '#fff' },
                              isDestructive && { color: theme.error },
                              !isPrimary && !isDestructive && { color: theme.text },
                            ]}
                          >
                            {action.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.tint }]}
                      onPress={onClose}
                    >
                      <Text style={[styles.actionText, { color: '#fff' }]}>Dismiss</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 20,
  },
  keyboardAvoiding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: Math.min(width * 0.85, 400),
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  customContent: {
    width: '100%',
    marginBottom: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
