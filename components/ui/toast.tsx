import { useTheme } from '@/hooks/useTheme';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './icon-symbol';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 10 }]}>
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            entering={FadeInUp.springify().damping(20).stiffness(140)}
            exiting={FadeOutUp.duration(250)}
            layout={Layout.springify().damping(25).stiffness(140)}
            style={[
              styles.toast,
              {
                backgroundColor: theme.card,
                borderLeftColor:
                  toast.type === 'success'
                    ? '#34c759'
                    : toast.type === 'error'
                      ? '#ff3b30'
                      : theme.tint,
                shadowColor: '#000',
              },
            ]}
          >
            <IconSymbol
              name={
                toast.type === 'success'
                  ? 'checkmark.circle.fill'
                  : toast.type === 'error'
                    ? 'exclamationmark.circle.fill'
                    : 'info.circle.fill'
              }
              size={20}
              color={
                toast.type === 'success'
                  ? '#34c759'
                  : toast.type === 'error'
                    ? '#ff3b30'
                    : theme.tint
              }
            />
            <Text style={[styles.text, { color: theme.text }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    gap: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    gap: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
