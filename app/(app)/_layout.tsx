// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import BackButton from '@/components/BackButton';
import AddButton from '@/components/AddButton';
import { useUserStore } from '@/store/user';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export default function TabLayout() {
  const username = useUserStore((s) => s.username);

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
          headerShown: true,
          headerTitle: () => (
            <View>
              <Text variant="h2">Hi {username}</Text>
              <Text variant="muted">Lets Make Progress Today</Text>
            </View>
          ),
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
        name="(Exercises)/index"
        options={{
          title: 'Exercise',
          headerShown: true,
          headerRight: () => <AddButton path="/(app)/(Exercises)/CreateExercises" />,
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(Exercises)/EditExercise"
        options={{
          title: 'Edit Exercise',
          headerLeft: () => <BackButton path="/(app)/(Exercises)" />,
          headerShown: true,
          href: null,
        }}
      />

      <Tabs.Screen
        name="(Exercises)/CreateExercises"
        options={{
          title: 'Create Exercises',
          headerLeft: () => <BackButton path="/(app)/(Exercises)" />,
          headerShown: true,
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
