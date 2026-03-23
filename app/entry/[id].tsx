import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { format, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useSelector((state: RootState) => state.health.entries.find((e) => e.id === id));
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!entry) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={64} color={theme.error} />
        <Text style={[styles.notFoundText, { color: theme.text }]}>Entry not found</Text>
      </View>
    );
  }

  const formattedDate = format(parseISO(entry.date), 'EEEE, MMMM do, yyyy');

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dateText, { color: theme.text }]}>{formattedDate}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/entry/edit/${id}`)}
              style={[styles.editButton, { backgroundColor: theme.tint + '15' }]}
            >
              <IconSymbol name="pencil" size={16} color={theme.tint} />
              <Text style={[styles.editButtonText, { color: theme.tint }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>How you felt</Text>
            <View style={[styles.moodRow, { backgroundColor: theme.tint + '15' }]}>
              <IconSymbol name="face.smiling" size={28} color={theme.tint} />
              <Text style={[styles.moodText, { color: theme.tint }]}>{entry.mood}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Core Metrics</Text>
            <View style={styles.metricsGrid}>
              <View
                style={[
                  styles.metricBox,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
              >
                <IconSymbol name="drop.fill" size={28} color="#34c759" />
                <Text style={[styles.metricValue, { color: theme.text }]}>{entry.waterIntake}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Glasses of Water
                </Text>
              </View>

              <View
                style={[
                  styles.metricBox,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
              >
                <IconSymbol name="bed.double.fill" size={28} color="#5856d6" />
                <Text style={[styles.metricValue, { color: theme.text }]}>{entry.sleepHours}</Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                  Hours of Sleep
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity</Text>
            {entry.exercise ? (
              <View
                style={[
                  styles.activityBox,
                  { backgroundColor: theme.background, borderColor: theme.border },
                ]}
              >
                <IconSymbol name="figure.walk" size={24} color="#ff9500" />
                <Text style={[styles.activityText, { color: theme.text }]}>{entry.exercise}</Text>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No activity recorded for this day.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes</Text>
            {entry.notes ? (
              <View style={[styles.notesBox, { backgroundColor: theme.tint + '10' }]}>
                <Text style={[styles.notesText, { color: theme.text }]}>{entry.notes}</Text>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No personal notes left for this day.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
  container: { flex: 1 },
  content: { padding: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: { fontSize: 14, fontWeight: 'bold' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: { padding: 8, marginLeft: -8 },
  dateText: { fontSize: 24, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  moodRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12 },
  moodText: { fontSize: 20, fontWeight: 'bold', textTransform: 'capitalize' },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  metricValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  metricLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  activityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  activityText: { fontSize: 16, fontWeight: '500' },
  emptyText: { fontSize: 14, fontStyle: 'italic' },
  notesBox: { padding: 16, borderRadius: 12 },
  notesText: { fontSize: 16, lineHeight: 24 },
});
