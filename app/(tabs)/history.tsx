import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomModal } from '@/components/ui/custom-modal';
import { useHealthEntries } from '@/hooks/useHealthEntries';
import { useTheme } from '@/hooks/useTheme';
import { deleteEntry } from '@/store/slices/healthSlice';
import { HealthEntry } from '@/types';
import { FlashList } from '@shopify/flash-list';
import { format, parseISO } from 'date-fns';
import { useRouter, Link } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function HistoryScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { sortedByNewest: sortedEntries } = useHealthEntries();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flashListRef = React.useRef<any>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulating remote fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 400);
  };

  const scrollToTop = () => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const getMoodColor = useCallback(
    (mood: string) => {
      const m = mood.toLowerCase();
      if (m.includes('happy') || m.includes('good') || m.includes('great'))
        return theme.success || '#34c759';
      if (m.includes('sad') || m.includes('bad')) return theme.error || '#ff3b30';
      if (m.includes('tired') || m.includes('sleepy')) return '#ff9500';
      if (m.includes('stress') || m.includes('anx')) return '#ff2d55';
      return theme.tint;
    },
    [theme],
  );

  const getMoodIcon = useCallback((mood: string) => {
    const m = mood.toLowerCase();
    if (m.includes('happy') || m.includes('good') || m.includes('great')) return 'face.smiling';
    if (m.includes('sad') || m.includes('bad')) return 'cloud.rain.fill';
    if (m.includes('tired') || m.includes('sleepy')) return 'moon.zzz';
    if (m.includes('stress') || m.includes('anx')) return 'bolt.fill';
    return 'circle.fill';
  }, []);

  const renderRightActions = useCallback(
    (id: string) => {
      const confirmDelete = () => {
        setDeletingId(id);
      };

      return (
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#5ac8fa' }]}
            onPress={() => router.push(`/entry/edit/${id}`)}
          >
            <IconSymbol name="pencil" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={confirmDelete}
          >
            <IconSymbol name="trash.fill" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    },
    [theme, dispatch, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: HealthEntry }) => {
      const formattedDate = format(parseISO(item.date), 'EEEE, MMMM do, yyyy');
      const moodColor = getMoodColor(item.mood);

      return (
        <ReanimatedSwipeable
          renderRightActions={() => renderRightActions(item.id)}
          overshootRight={false}
        >
          <View style={{ paddingHorizontal: 16, backgroundColor: theme.background }}>
            <Link href={`/entry/${item.id}`} asChild>
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.isDark ? '#52525b' : '#d1d5db',
                    borderWidth: 2,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.dateText, { color: theme.text }]}>{formattedDate}</Text>
                  </View>
                  <View style={[styles.moodBadge, { backgroundColor: moodColor + '20' }]}>
                    <IconSymbol name={getMoodIcon(item.mood)} size={16} color={moodColor} />
                    <Text style={[styles.moodText, { color: moodColor }]}>{item.mood}</Text>
                  </View>
                </View>

                <View style={[styles.statsRow, { backgroundColor: theme.background }]}>
                  <View style={styles.statItem}>
                    <IconSymbol name="drop.fill" size={20} color="#34c759" />
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {item.waterIntake} glasses
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <IconSymbol name="bed.double.fill" size={20} color="#5856d6" />
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {item.sleepHours} hours
                    </Text>
                  </View>
                </View>

                {item.exercise ? (
                  <View style={styles.activityRow}>
                    <IconSymbol name="figure.walk" size={16} color="#ff9500" />
                    <Text style={[styles.activityText, { color: theme.text }]}>
                      {item.exercise}
                    </Text>
                  </View>
                ) : null}

                {item.notes ? (
                  <View style={[styles.notesContainer, { backgroundColor: theme.tint + '10' }]}>
                    <Text style={[styles.notesText, { color: theme.text }]}>{item.notes}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </Link>
          </View>
        </ReanimatedSwipeable>
      );
    },
    [theme, getMoodColor, getMoodIcon, renderRightActions],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {sortedEntries.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
          }
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="History"
            subtitle="Review your past health logs"
            action={{
              icon: 'plus',
              onPress: () => router.push('/log'),
            }}
          />
          <EmptyState
            icon="calendar.badge.exclamationmark"
            title="Your story hasn't started yet"
            subtitle="Log your daily wellness metrics to see your health journey unfold here."
            actionLabel="Record Your First Entry"
            onAction={() => router.push('/log')}
          />
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            ref={flashListRef}
            data={sortedEntries}
            // @ts-ignore
            estimatedItemSize={220}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <ScreenHeader
                title="History"
                subtitle="Review your past health logs"
                action={{
                  icon: 'plus',
                  onPress: () => router.push('/log'),
                }}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.tint}
              />
            }
          />
        </View>
      )}

      {showScrollTop && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint + 'D9' }]}
          onPress={scrollToTop}
          activeOpacity={0.6}
        >
          <IconSymbol name="arrow.up" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}

      <CustomModal
        visible={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Entry?"
        message="This will permanently remove this record from your history. This action cannot be reversed."
        icon="trash.fill"
        iconColor={theme.error}
        actions={[
          {
            label: 'Cancel',
            onPress: () => setDeletingId(null),
            style: 'secondary',
          },
          {
            label: 'Delete Permanent',
            onPress: () => {
              if (deletingId) {
                dispatch(deleteEntry(deletingId));
                setDeletingId(null);
              }
            },
            style: 'destructive',
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  listContainer: { flex: 1, paddingBottom: 20, paddingTop: 10 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateText: { fontSize: 16, fontWeight: 'bold' },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  moodText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statDivider: { width: 1, height: '100%' },
  statValue: { fontSize: 14, fontWeight: '600' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  activityText: { fontSize: 14, fontWeight: '500' },
  notesContainer: { padding: 12, borderRadius: 8, marginTop: 8 },
  notesText: { fontSize: 14, fontStyle: 'italic' },
  rightActions: { flexDirection: 'row', width: 160, marginBottom: 16 },
  actionButton: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
