import AntDesign from '@expo/vector-icons/AntDesign';
import { Button } from './ui/button';
import { useRouter } from 'expo-router';
import { BackButtonType } from '@/types/types';

export default function AddButton({ path }: BackButtonType) {
  const router = useRouter();
  return (
    <Button size="icon" className="mr-5 rounded-full" onPress={() => router.push(path)}>
      <AntDesign name="plus" size={24} />
    </Button>
  );
}
