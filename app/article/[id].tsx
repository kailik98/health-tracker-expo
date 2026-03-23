import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@apollo/client';
import { GET_HEALTH_ARTICLE } from '@/api/graphql';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const ArticleSkeleton = ({ theme }: { theme: any }) => {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  const skeletonColor = theme.border;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.heroImage, { backgroundColor: skeletonColor, opacity }]} />
      <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
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
            { backgroundColor: skeletonColor, width: '90%', height: 32, marginBottom: 20, opacity },
          ]}
        />
        <View style={styles.metaRow}>
          <View style={styles.authorContainer}>
            <Animated.View
              style={[styles.avatarStyle, { backgroundColor: skeletonColor, opacity }]}
            />
            <Animated.View
              style={[
                styles.skeletonText,
                {
                  backgroundColor: skeletonColor,
                  width: 100,
                  height: 14,
                  marginBottom: 0,
                  opacity,
                },
              ]}
            />
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '100%', height: 16, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '100%', height: 16, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '90%', height: 16, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '100%', height: 16, opacity, marginTop: 12 },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonText,
            { backgroundColor: skeletonColor, width: '80%', height: 16, opacity },
          ]}
        />
      </View>
    </View>
  );
};

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const { data, loading, error } = useQuery(GET_HEALTH_ARTICLE, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const article = data?.post;
  const tags = article?.tags || [];
  const likes = article?.reactionCount || 0;

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: any) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setShowScrollTop(offsetY > 400);
    },
  });

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ArticleSkeleton theme={theme} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>Oops! Failed to load article.</Text>
        <TouchableOpacity
          style={[styles.backBtnFallback, { backgroundColor: theme.tint }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        ref={scrollRef as any}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Image
          source={{ uri: article.coverImage?.url || `https://picsum.photos/seed/${id}art/800/600` }}
          style={styles.heroImage}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {/* Floating Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10, backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          <View style={styles.tagsContainer}>
            {tags.map((tag: any, index: number) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.tint + '15' }]}>
                <Text style={[styles.tagText, { color: theme.tint }]}>{tag.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{article.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.authorContainer}>
              {article.author?.profilePicture ? (
                <Image source={{ uri: article.author.profilePicture }} style={styles.avatarStyle} />
              ) : (
                <View style={[styles.avatarStyle, { backgroundColor: theme.tint }]} />
              )}
              <Text style={[styles.authorName, { color: theme.text }]}>
                {article.author?.name || 'Hashnode Author'}
              </Text>
            </View>
            <View style={styles.reaction}>
              <IconSymbol name="heart.fill" size={16} color={theme.error} />
              <Text style={[styles.reactionText, { color: theme.textSecondary }]}>
                {likes} likes
              </Text>
            </View>

            <View style={styles.reaction}>
              <IconSymbol name="clock.fill" size={16} color={theme.textSecondary} />
              <Text style={[styles.reactionText, { color: theme.textSecondary }]}>
                {article.readTimeInMinutes || 5} min read
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.bodyText, { color: theme.text }]}>
            {article.content?.text || 'Article content is presently unavailable.'}
          </Text>
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {showScrollTop && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.tint + 'D9' }]}
          onPress={scrollToTop}
          activeOpacity={0.6}
        >
          <IconSymbol name="arrow.up" size={28} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 16, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  backBtnFallback: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },

  heroImage: { width: '100%', height: 350 },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  tagText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  title: { fontSize: 28, fontWeight: '800', lineHeight: 36, marginBottom: 20 },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  authorContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarStyle: { width: 32, height: 32, borderRadius: 16 },
  authorName: { fontSize: 14, fontWeight: '600' },

  reaction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reactionText: { fontSize: 14, fontWeight: '500' },

  divider: { height: 1, width: '100%', opacity: 0.5, marginBottom: 24 },
  bodyText: { fontSize: 18, lineHeight: 28, letterSpacing: 0.2 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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

  skeletonTag: { height: 24, borderRadius: 6, marginRight: 8 },
  skeletonText: { height: 14, borderRadius: 4, marginBottom: 12 },
});
