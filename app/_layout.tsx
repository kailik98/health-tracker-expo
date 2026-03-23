import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ToastProvider } from '@/components/ui/toast';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/api/client';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const resolvedColorScheme = (colorScheme ?? 'light') as 'light' | 'dark';
  const customTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      background: Colors[resolvedColorScheme].background,
      card: Colors[resolvedColorScheme].card,
      text: Colors[resolvedColorScheme].text,
      border: Colors[resolvedColorScheme].border,
      notification: Colors[resolvedColorScheme].tint,
    },
  };

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Colors[resolvedColorScheme].background }}
    >
      <ApolloProvider client={client}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider value={customTheme}>
              <ToastProvider>
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: Colors[resolvedColorScheme].background },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ToastProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  // We use hardcoded stylistic fallbacks here to prevent any dependency
  // hooks (like theme providers) from continuously crashing the error boundary itself.
  return (
    <View style={styles.errorContainer}>
      <IconSymbol name="exclamationmark.triangle.fill" size={64} color="#ff3b30" />
      <Text style={styles.errorTitle}>Something went wrong!</Text>
      <Text style={styles.errorMessage}>
        {error.message || 'An unexpected application error occurred. We have logged the issue.'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Restart Session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#111827',
  },
  errorMessage: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
