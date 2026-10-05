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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(Workout)/index"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="dumbbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(Workout)/CreateWorkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(Workout)/EditWorkout"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="(Exercises)/index"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(Exercises)/CreateExercises"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="Progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Entypo name="bar-graph" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(Images)/index"
        options={{
          title: 'Upload Image',
          tabBarIcon: ({ color, size }) => <Entypo name="image" size={size} color={color} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
