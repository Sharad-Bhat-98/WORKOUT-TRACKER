// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const unstable_settings = {
  anchor: 'HomePage',
};

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="HomePage"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="PrevSessions"
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="Workout"
        options={{
          title: 'Workout',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="dumbbell" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Exercises"
        options={{
          title: 'Exercise',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports-gymnastics" size={size} color={color as string} />
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
        name="Images"
        options={{
          title: 'Upload Image',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="image" size={size} color={color as string} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-circle" size={size} color={color as string} />
          ),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
