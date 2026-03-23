import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery } from '@apollo/client';
import { GET_HEALTH_ARTICLES } from '@/api/graphql';
import { useTheme } from '@/hooks/useTheme';

interface ExternalArticle {
  id: string;
  title: string;
  brief: string;
  coverImage?: { url: string };
  author?: { name: string; profilePicture?: string };
  readTimeInMinutes?: number;
  tags?: { name: string }[];
  reactionCount?: number;
}

const SkeletonCard = ({ theme }: { theme: any }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  const skeletonColor = theme.border;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: 'transparent' }]}>
      <Animated.View style={[styles.skeletonImage, { backgroundColor: skeletonColor, opacity }]} />
      <View style={styles.cardContent}>
        <View style={styles.tagsContainer}>
          <Animated.View
            style={[styles.skeletonTag, { backgroundColor: skeletonColor, width: 80, opacity }]}
          />
          <Animated.View
            style={[styles.skeletonTag, { backgroundColor: skeletonColor, width: 60, opacity }]}
          />
        </View>
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '90%', height: 22, marginBottom: 10, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '60%', height: 22, marginBottom: 16, opacity },
          ]}
        />

        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '100%', height: 14, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '80%', height: 14, opacity },
          ]}
        />

        <View
          style={[styles.footer, { borderTopColor: theme.border, marginTop: 16, paddingTop: 12 }]}
        >
          <Animated.View
            style={[
              styles.skeletonText,
              { backgroundColor: skeletonColor, width: 60, height: 16, marginBottom: 0, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonText,
              { backgroundColor: skeletonColor, width: 40, height: 16, marginBottom: 0, opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default function ExploreScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const flashListRef = useRef<any>(null);
  const theme = useTheme();

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_HEALTH_ARTICLES, {
    variables: { first: 10 },
    fetchPolicy: 'cache-and-network',
  });

  const [loadingMore, setLoadingMore] = useState(false);
  const posts = data?.tag?.posts;
  const articles: ExternalArticle[] = posts?.edges?.map((edge: any) => edge.node) || [];
  const pageInfo = posts?.pageInfo;

  const handleLoadMore = async () => {
    if (!pageInfo?.hasNextPage || loadingMore || loading) return;

    setLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          after: pageInfo.endCursor,
        },
      });
    } catch (e) {
      console.error('Error fetching more:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch({ first: 10, after: null });
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ExternalArticle }) => {
      const displayTags = item.tags?.slice(0, 2) || [];
      const likes = item.reactionCount || 0;

      return (
        <View style={{ paddingHorizontal: 16, backgroundColor: theme.background }}>
          <Link href={`/article/${item.id}` as any} asChild>
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.isDark ? '#52525b' : '#d1d5db',
                },
              ]}
              activeOpacity={0.7}
            >
              <Image
                source={{
                  uri: item.coverImage?.url || `https://picsum.photos/seed/${item.id}exp/800/400`,
                }}
                style={[styles.image, { backgroundColor: theme.border }]}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
              <View style={styles.cardContent}>
                <View style={styles.tagsContainer}>
                  {displayTags.map((tag: any, index: number) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.tint + '15' }]}>
                      <Text style={[styles.tagText, { color: theme.tint }]}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.articleTitle, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.articleBody, { color: theme.textSecondary }]} numberOfLines={3}>
                  {item.brief}
                </Text>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                  <View style={styles.reaction}>
                    <IconSymbol name="clock.fill" size={14} color={theme.textSecondary} />
                    <Text style={[styles.reactionText, { color: theme.textSecondary }]}>
                      {item.readTimeInMinutes || 5} min read
                    </Text>
                  </View>
                  <View style={styles.reaction}>
                    <IconSymbol name="heart.fill" size={14} color={theme.error} />
                    <Text style={[styles.reactionText, { color: theme.textSecondary }]}>{likes}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      );
    },
    [theme],
  );

  const renderHeader = () => (
    <ScreenHeader title="Explore" subtitle="Dive into curated health tips and articles." />
  );

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 400);
  };

  const scrollToTop = useCallback(() => {
    if (flashListRef.current && (flashListRef.current as any).scrollToOffset) {
      (flashListRef.current as any).scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <View style={styles.listContainer}>
          <View style={{ paddingHorizontal: 16 }}>
            <SkeletonCard theme={theme} />
            <SkeletonCard theme={theme} />
            <SkeletonCard theme={theme} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>Oops! GraphQL query failed.</Text>
        <Text style={[styles.errorSubText, { color: theme.textSecondary }]}>{error.message}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.tint }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Retry Query</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (articles.length === 0 && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <EmptyState
          icon="safari.fill"
          title="The feed is quiet today"
          subtitle="We couldn't find any new articles. Try refreshing to see the latest health tips."
          actionLabel="Refresh Feed"
          onAction={onRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlashList
        ref={flashListRef as any}
        data={articles}
        // @ts-ignore
        estimatedItemSize={280}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ paddingBottom: 20, paddingHorizontal: 16 }}>
              <SkeletonCard theme={theme} />
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.tint]}
            tintColor={theme.tint}
          />
        }
      />

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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 16, fontSize: 18, fontWeight: 'bold' },
  errorSubText: { marginTop: 8, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  listContainer: { paddingBottom: 20 },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
  },
  image: { width: '100%', height: 160 },
  cardContent: { padding: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 },
  tagText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  articleTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, lineHeight: 24 },
  articleBody: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  reaction: { flexDirection: 'row', alignItems: 'center' },
  reactionText: { fontSize: 14, marginLeft: 4, fontWeight: '500' },
  skeletonImage: { width: '100%', height: 160 },
  skeletonTag: { width: 48, height: 24, borderRadius: 4, marginRight: 8 },
  skeletonText: { height: 14, borderRadius: 4, marginBottom: 8 },
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
