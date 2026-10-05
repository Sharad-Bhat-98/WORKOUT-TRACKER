import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Exercise() {
  const router = useRouter();
  return (
    <SafeAreaView className="w-full p-5">
      <View className="mb-8 w-full flex-row items-center justify-between">
        <Text variant="h1" className="text-center">
          Exercise
        </Text>
        <Button
          size="icon"
          className="rounded-full"
          onPress={() => router.push('/(app)/(Exercises)/CreateExercises')}>
          <AntDesign name="plus" size={24} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
