import { IconSymbol } from '@/components/ui/icon-symbol';
import { useHealthEntries } from '@/hooks/useHealthEntries';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { recalculateGoals } from '@/store/slices/healthSlice';
import { format, parseISO } from 'date-fns';
import { Link } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/toast';
import { ScreenHeader } from '@/components/ui/screen-header';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { entries } = useSelector((state: RootState) => state.health);
  const goals = useSelector((state: RootState) => state.health.goals);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = React.useRef<ScrollView>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(recalculateGoals());
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [dispatch]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 400);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const { totalWater, averageSleep, mostFrequentMood } = useMemo(() => {
    if (entries.length === 0) return { totalWater: 0, averageSleep: 0, mostFrequentMood: '-' };

    const totalWater = entries.reduce((sum, entry) => sum + entry.waterIntake, 0);
    const averageSleep = entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length;

    const moodCounts = entries.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    let mostFrequentMood = '-';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentMood = mood;
      }
    });

    return { totalWater, averageSleep, mostFrequentMood };
  }, [entries]);

  const sortedEntriesForCharts = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [entries]);

  const chartLabels = sortedEntriesForCharts.slice(-7).map((e) => format(parseISO(e.date), 'MM/dd'));
  const waterData = sortedEntriesForCharts.slice(-7).map((e) => e.waterIntake);
  const sleepData = sortedEntriesForCharts.slice(-7).map((e) => e.sleepHours);

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: theme.tint },
    propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border, strokeWidth: 0.5 },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
      >
        <ScreenHeader title="Dashboard" subtitle="Your health trends at a glance" />

        {/* --- Goals Summary --- */}
        {goals.length > 0 && (
          <View
            style={[
              styles.goalsContainer,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Goals</Text>
              <Link href="/goals" asChild>
                <TouchableOpacity>
                  <Text style={{ color: theme.tint, fontWeight: '600' }}>Manage</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {goals.map((goal) => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              return (
                <View key={goal.id} style={styles.goalRow}>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalLabel, { color: theme.text }]}>{goal.title}</Text>
                    <Text style={[styles.goalProgressText, { color: theme.textSecondary }]}>
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </Text>
                  </View>
                  <View style={[styles.goalBarBg, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.goalBarFill,
                        { width: `${progress}%`, backgroundColor: theme.tint },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="drop.fill" size={24} color="#34c759" />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Water</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{totalWater} glasses</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="bed.double.fill" size={24} color="#5856d6" />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Avg Sleep</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {averageSleep.toFixed(1)} hrs
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <IconSymbol name="face.smiling" size={24} color="#ff9500" />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Common Mood</Text>
            <Text style={[styles.summaryValue, { color: theme.text, textTransform: 'capitalize' }]}>
              {mostFrequentMood}
            </Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View
            style={[
              styles.chartPlaceholder,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <IconSymbol name="chart.bar.xaxis" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text, marginTop: 16 }]}>
              Hungry for Data
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary, marginBottom: 32 }]}>
              Your health trends will appear here once you start logging your daily metrics.
            </Text>

            <View style={styles.emptyActions}>
              <Link href="/log" asChild>
                <TouchableOpacity style={[styles.ctaButton, { backgroundColor: theme.tint }]}>
                  <Text style={styles.ctaButtonText}>Start Your Health Log</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ) : (
          <>
            {/* Water Bar Chart */}
            <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.chartTitle, { color: theme.text }]}>
                Water Intake (Last 7 Logs)
              </Text>
              <BarChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: waterData }],
                }}
                width={screenWidth - 70}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
              />
            </View>

            {/* Sleep Line Chart */}
            <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 40 },
              ]}
            >
              <Text style={[styles.chartTitle, { color: theme.text }]}>
                Sleep Trends (Last 7 Logs)
              </Text>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: sleepData }],
                }}
                width={screenWidth - 70}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(88, 86, 214, ${opacity})`,
                }}
                bezier
                style={styles.chart}
                verticalLabelRotation={30}
              />
            </View>
          </>
        )}
      </ScrollView>

      {showScrollTop && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint + 'D9' }]}
          onPress={scrollToTop}
          activeOpacity={0.6}
        >
          <IconSymbol name="arrow.up" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  summaryLabel: { fontSize: 10, fontWeight: '700', marginTop: 8, textTransform: 'uppercase' },
  summaryValue: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  chartPlaceholder: {
    marginHorizontal: 16,
    padding: 40,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  emptyActions: { width: '100%' },
  ctaButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
  ctaButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  seedButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
  goalsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  goalRow: { marginBottom: 16 },
  goalInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { fontSize: 15, fontWeight: '600' },
  goalProgressText: { fontSize: 13 },
  goalBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  goalBarFill: { height: '100%', borderRadius: 3 },
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
