// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="(HomePage)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(PrevSessions)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(Workout)"
        options={{
          title: 'Workout',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="dumbbell" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(Exercises)"
        options={{
          title: 'Exercise',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color as string} />
          ),
        }}
      />

      <Tabs.Screen
        name="Progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="bar-graph" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="(Images)/index"
        options={{
          title: 'Upload Image',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="image" size={size} color={color as string} />
          ),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
