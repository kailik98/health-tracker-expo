import { CustomModal } from '@/components/ui/custom-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { addGoal, deleteGoal, recalculateGoals } from '@/store/slices/healthSlice';
import { Goal } from '@/types';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function GoalsScreen() {
  const dispatch = useDispatch();
  const goals = useSelector((state: RootState) => state.health.goals);
  const theme = useTheme();
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newType, setNewType] = useState<Goal['type']>('WATER');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flashListRef = React.useRef<any>(null);

  React.useEffect(() => {
    dispatch(recalculateGoals());
  }, [dispatch, goals.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(recalculateGoals());
    setTimeout(() => setRefreshing(false), 800);
  }, [dispatch]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 400);
  };

  const scrollToTop = () => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleAddGoal = useCallback(() => {
    if (!newTitle || !newTarget) return;

    const unit = newType === 'WATER' ? 'Glasses' : 'Hours';

    const goal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      targetValue: parseFloat(newTarget),
      currentValue: 0,
      unit: unit,
      type: newType,
    };
    dispatch(addGoal(goal));
    dispatch(recalculateGoals());
    showToast(`Goal: ${newTitle} created successfully`);
    setModalVisible(false);
    setNewTitle('');
    setNewTarget('');
  }, [newTitle, newTarget, newType, dispatch, showToast]);

  const renderRightActions = useCallback(
    (id: string) => {
      const confirmDelete = () => {
        setDeletingId(id);
      };

      return (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.error }]}
          onPress={confirmDelete}
        >
          <IconSymbol name="trash.fill" size={24} color="#fff" />
        </TouchableOpacity>
      );
    },
    [theme, dispatch],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const progress = Math.min((item.currentValue / item.targetValue) * 100, 100);
      const isCompleted = item.currentValue >= item.targetValue;

      // Dynamic styles based on theme
      const dynamicCardStyles = {
        backgroundColor: theme.card,
        borderColor: isCompleted
          ? theme.success || '#34c759'
          : theme.isDark
          ? '#52525b'
          : '#d1d5db',
        borderWidth: 2,
      };

      return (
        <ReanimatedSwipeable
          renderRightActions={() => renderRightActions(item.id)}
          overshootRight={false}
        >
          <View style={{ paddingHorizontal: 16, backgroundColor: theme.background }}>
            <View style={[styles.card, dynamicCardStyles]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.goalTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>
                    {item.currentValue} / {item.targetValue} {item.unit}
                  </Text>
                </View>
                {isCompleted ? (
                  <IconSymbol
                    name="checkmark.seal.fill"
                    size={24}
                    color={theme.success || '#34c759'}
                  />
                ) : null}
              </View>

              <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress}%`, backgroundColor: theme.tint },
                  ]}
                />
              </View>
            </View>
          </View>
        </ReanimatedSwipeable>
      );
    },
    [theme, renderRightActions],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.listContainer}>
        <FlashList
          ref={flashListRef}
          data={goals}
          // @ts-ignore
          estimatedItemSize={180}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={
            <ScreenHeader
              title="Goals"
              subtitle="Set targets and track your growth"
              action={{
                icon: 'plus',
                onPress: () => setModalVisible(true),
              }}
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="target"
              title="No goals yet"
              subtitle="Set your first health target and let the app track your progress automatically!"
              actionLabel="Create Your First Goal"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      </View>

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
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="New Goal"
        message="Set a meaningful target to track your progress."
        icon="target"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setModalVisible(false),
            style: 'secondary',
          },
          {
            label: 'Save Goal',
            onPress: handleAddGoal,
            style: 'primary',
          },
        ]}
      >
        <View style={styles.formContent}>
          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={[
                styles.pickerItem,
                newType === 'WATER' && { backgroundColor: theme.tint, borderColor: theme.tint },
              ]}
              onPress={() => setNewType('WATER')}
            >
              <IconSymbol
                name="drop.fill"
                size={18}
                color={newType === 'WATER' ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.pickerText,
                  { color: newType === 'WATER' ? '#fff' : theme.textSecondary },
                ]}
              >
                Water
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerItem,
                newType === 'SLEEP' && { backgroundColor: theme.tint, borderColor: theme.tint },
              ]}
              onPress={() => setNewType('SLEEP')}
            >
              <IconSymbol
                name="moon.fill"
                size={18}
                color={newType === 'SLEEP' ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.pickerText,
                  { color: newType === 'SLEEP' ? '#fff' : theme.textSecondary },
                ]}
              >
                Sleep
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Goal Title (e.g. Stay Hydrated)"
            placeholderTextColor={theme.textSecondary}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={`Target (${newType === 'WATER' ? '8' : '8.0'})`}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={newTarget}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                setNewTarget(sanitized);
              }}
            />
            <View style={[styles.unitBadge, { backgroundColor: theme.border }]}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {newType === 'WATER' ? 'Glasses' : 'Hours'}
              </Text>
            </View>
          </View>
        </View>
      </CustomModal>

      <CustomModal
        visible={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Drop this Goal?"
        message="You're doing great! Are you sure you want to stop tracking this progress?"
        icon="trash.fill"
        iconColor={theme.error}
        actions={[
          {
            label: 'Keep It',
            onPress: () => setDeletingId(null),
            style: 'secondary',
          },
          {
            label: 'Delete Permanent',
            onPress: () => {
              if (deletingId) {
                dispatch(deleteGoal(deletingId));
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: { fontSize: 32, fontWeight: 'bold' },
  listContainer: { flex: 1 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalTitle: { fontSize: 18, fontWeight: 'bold' },
  goalTarget: { fontSize: 14, marginTop: 4 },
  progressBarContainer: { height: 8, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pickerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerText: { fontWeight: '600' },
  unitBadge: {
    flex: 0.6,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  formContent: { padding: 20 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 16,
  },
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
