import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * A custom hook that isolates Redux entry fetching and chronologically sorts the data.
 * Useful for history lists or timeline charts.
 */
export function useHealthEntries() {
  const entries = useSelector((state: RootState) => state.health.entries);

  const sortedByNewest = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const sortedByOldest = useMemo(() => {
    return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  return {
    entries,
    sortedByNewest,
    sortedByOldest,
  };
}
