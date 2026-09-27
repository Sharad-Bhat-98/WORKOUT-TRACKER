import { Text } from '@/components/ui/text';
import { useUserStore } from '@/store/user';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const userStore = useUserStore();

  return (
    <SafeAreaView className="p-2">
      <Text variant="h2" className="text-left">
        Hi {userStore.username}
      </Text>
      <Text variant="muted">Lets Make Progress Today</Text>
    </SafeAreaView>
  );
}
