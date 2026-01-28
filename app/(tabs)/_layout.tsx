import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // This completely hides the bottom tab bar globally
        tabBarStyle: { display: 'none' }, 
      }}
    >
      {/* Keep the index screen defined so the app 
         knows what to load first, but it won't show a tab.
      */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}