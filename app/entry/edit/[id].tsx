import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomModal } from '@/components/ui/custom-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { updateEntry } from '@/store/slices/healthSlice';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { RootState } from '@/store';
import { isSameDay, parseISO } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { EntryForm, FormData } from '@/components/entry-form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/ui/toast';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const entries = useSelector((state: RootState) => state.health.entries);
  const [error, setError] = React.useState<string | null>(null);

  const existingEntry = useSelector((state: RootState) =>
    state.health.entries.find((e) => e.id === id),
  );

  if (!existingEntry) {
    return null;
  }

  const onSubmit = (data: FormData) => {
    setError(null);
    // Check for duplicates excluding current entry
    const duplicate = entries.find(
      (e) => e.id !== id && isSameDay(parseISO(e.date), data.date)
    );

    if (duplicate) {
      setError('Another entry already exists for this date. Please choose a different date.');
      showToast('Cannot update: entry already exists for this date.', 'error');
      return;
    }

    dispatch(
      updateEntry({
        ...existingEntry,
        ...data,
        exercise: data.exercise || '',
        notes: data.notes || '',
        date: data.date.toISOString(),
      }),
    );

    showToast('Entry updated successfully', 'success');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <EntryForm
        initialValues={{
          ...existingEntry,
          date: new Date(existingEntry.date),
        }}
        onSubmit={onSubmit}
        onBack={() => router.back()}
        title="Edit Log"
        subtitle="Amend your previous journal."
        submitLabel="Update Entry"
        error={error}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
