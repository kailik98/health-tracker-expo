import { format, isToday, isYesterday } from 'date-fns';

export const formatDate = (date: Date | string | number) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM dd, yyyy');
};

export const getTimeString = (date: Date | string | number) => {
  return format(new Date(date), 'HH:mm');
};
