import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from './ui/button';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { BackButtonType } from '@/types/types';

export default function BackButton({ path }: BackButtonType) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <Button size="icon" variant="ghost" className="rounded-full" onPress={() => router.push(path)}>
      <AntDesign name="arrow-left" size={24} color={colorScheme === 'light' ? 'black' : 'white'} />
    </Button>
  );
}
