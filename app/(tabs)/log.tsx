import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addEntry } from '@/store/slices/healthSlice';
import { useRouter } from 'expo-router';
import { RootState } from '@/store';
import { isSameDay, parseISO } from 'date-fns';
import { HealthEntry } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { EntryForm, FormData } from '@/components/entry-form';
import { useToast } from '@/components/ui/toast';

export default function LogScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const { showToast } = useToast();
  const entries = useSelector((state: RootState) => state.health.entries);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = (data: FormData) => {
    setError(null);
    // Prevent duplicate entries for the same date
    const duplicate = entries.find((e) => isSameDay(parseISO(e.date), data.date));

    if (duplicate) {
      setError('An entry already exists for this date. Please edit the existing one.');
      showToast('Cannot save: entry already exists for this date.', 'error');
      return;
    }

    const newEntry: HealthEntry = {
      ...data,
      exercise: data.exercise || '',
      notes: data.notes || '',
      id: Date.now().toString(),
      date: data.date.toISOString(),
    };

    dispatch(addEntry(newEntry));
    showToast('Your wellness metrics have been preserved.', 'success');
    router.push('/history');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <EntryForm
        onSubmit={onSubmit}
        title="Daily Log"
        subtitle="Capture your wellness metrics"
        submitLabel="Save Entry"
        error={error}
      />
    </SafeAreaView>
  );
}
