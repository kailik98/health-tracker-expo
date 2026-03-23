import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        lazy: false, // Pre-render tabs to avoid flickering on first switch
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      }}
    >
      {/* 1st Tab: Now the Index (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />

      {/* 2nd Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />

      {/* 3rd Tab: Floating Action Button (Log) */}
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={{
                top: -15, // Lift above the tab bar
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.tint,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.tint,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 8,
                borderWidth: 4,
                borderColor: theme.background, // Creates a nice "cutout" visual effect against the page background!
              }}
            >
              <IconSymbol size={32} name="plus" color="#fff" />
            </View>
          ),
        }}
      />

      {/* 4th Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="safari.fill" color={color} />,
        }}
      />

      {/* 5th Tab */}
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
