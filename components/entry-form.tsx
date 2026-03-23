import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/screen-header';

export const formSchema = z.object({
  date: z.date(),
  mood: z.string().min(1, 'Please tell us how you feel'),
  waterIntake: z.coerce
    .number()
    .min(0, "Can't drink negative water")
    .max(20, "That's too much water!"),
  exercise: z.string().optional(),
  sleepHours: z.coerce.number().min(0).max(24, 'There are only 24 hours in a day'),
  notes: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

const MOODS = [
  { label: 'Happy', icon: 'face.smiling', color: '#34c759' },
  { label: 'Calm', icon: 'circle.fill', color: '#5ac8fa' },
  { label: 'Energetic', icon: 'bolt.fill', color: '#ffcc00' },
  { label: 'Tired', icon: 'moon.zzz', color: '#ff9500' },
  { label: 'Stressed', icon: 'cloud.rain.fill', color: '#ff3b30' },
] as const;

interface EntryFormProps {
  initialValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  title: string;
  subtitle: string;
  submitLabel: string;
  onBack?: () => void;
  error?: string | null;
}

export function EntryForm({
  initialValues,
  onSubmit,
  title,
  subtitle,
  submitLabel,
  onBack,
  error,
}: EntryFormProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView>(null);

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      date: initialValues?.date || new Date(),
      mood: initialValues?.mood || '',
      waterIntake: initialValues?.waterIntake || 0,
      exercise: initialValues?.exercise || '',
      sleepHours: initialValues?.sleepHours || 8,
      notes: initialValues?.notes || '',
    },
  });

  React.useEffect(() => {
    if (error) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [error]);

  const minimalInputStyle = {
    backgroundColor: theme.card,
    color: theme.text,
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 + insets.top : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          style={{ paddingHorizontal: 0 }}
        />

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#ff3b3015', borderColor: '#ff3b30' }]}>
            <IconSymbol name="exclamationmark.circle.fill" size={20} color="#ff3b30" />
            <Text style={[styles.errorBannerText, { color: '#ff3b30' }]}>{error}</Text>
          </View>
        ) : null}

        {/* DATE PICKER */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Log Date</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { value } }) => (
            <View>
              <TouchableOpacity
                style={[styles.dateCard, { backgroundColor: theme.card }]}
                onPress={handleDatePress}
                activeOpacity={0.7}
              >
                <View style={[styles.dateIconContainer, { backgroundColor: theme.tint + '15' }]}>
                  <IconSymbol name="calendar" size={24} color={theme.tint} />
                </View>
                <View style={styles.dateTextContainer}>
                  <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Log Date</Text>
                  <Text style={[styles.dateValue, { color: theme.text }]}>{format(value, 'PPPP')}</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={value}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setValue('date', selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
          )}
        />

        {/* MOOD SELECTION */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>How are you feeling?</Text>
        <Controller
          control={control}
          name="mood"
          render={({ field: { onChange, value } }) => (
            <View style={styles.moodContainer}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.label}
                  style={[
                    styles.moodItem,
                    { backgroundColor: theme.card },
                    value === mood.label && {
                      borderColor: mood.color,
                      backgroundColor: mood.color + '10',
                    },
                  ]}
                  onPress={() => onChange(mood.label)}
                >
                  <IconSymbol
                    name={mood.icon as any}
                    size={32}
                    color={value === mood.label ? mood.color : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: value === mood.label ? theme.text : theme.textSecondary },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.mood && <Text style={styles.errorText}>{errors.mood.message}</Text>}

        {/* WATER & SLEEP */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Water Intake</Text>
            <Controller
              control={control}
              name="waterIntake"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={[styles.inputContainer, minimalInputStyle, errors.waterIntake && { borderColor: '#ff3b30', borderWidth: 1 }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={value === 0 ? '' : value.toString()}
                      onChangeText={(text) => {
                        const sanitized = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
                        onChange(sanitized === '' ? 0 : parseInt(sanitized, 10));
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                    />
                    <Text style={[styles.unit, { color: theme.textSecondary }]}>glasses</Text>
                  </View>
                  {errors.waterIntake && <Text style={styles.errorText}>{errors.waterIntake.message}</Text>}
                </View>
              )}
            />
          </View>

          <View style={styles.column}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Sleep</Text>
            <Controller
              control={control}
              name="sleepHours"
              render={({ field: { onChange, value } }) => (
                <View>
                  <View style={[styles.inputContainer, minimalInputStyle, errors.sleepHours && { borderColor: '#ff3b30', borderWidth: 1 }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={value === 0 ? '' : value.toString()}
                      onChangeText={(text) => {
                        const sanitized = text.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                        onChange(sanitized === '' ? 0 : parseFloat(sanitized));
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                    />
                    <Text style={[styles.unit, { color: theme.textSecondary }]}>hours</Text>
                  </View>
                  {errors.sleepHours && <Text style={styles.errorText}>{errors.sleepHours.message}</Text>}
                </View>
              )}
            />
          </View>
        </View>

        {/* EXERCISE */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Exercise</Text>
        <Controller
          control={control}
          name="exercise"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.textArea, minimalInputStyle]}
              value={value}
              onChangeText={onChange}
              placeholder="What did you do today?"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          )}
        />

        {/* NOTES */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.textArea, minimalInputStyle]}
              value={value}
              onChangeText={onChange}
              placeholder="Any other thoughts?"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          )}
        />

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.tint }]}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  dateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodItem: {
    width: '30.5%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    height: 100,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
});
