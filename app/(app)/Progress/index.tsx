import ProgressComponent from '@/components/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUserStore } from '@/store/user';

export default function Progress() {
  const [value, setValue] = useState('1 Week');

  return (
    <SafeAreaView className="w-full flex-1 items-center p-2 pt-5">
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger value="1 Week">
            <Text>1 Week</Text>
          </TabsTrigger>
          <TabsTrigger value="4 Weeks">
            <Text>4 Weeks</Text>
          </TabsTrigger>
          <TabsTrigger value="12 Weeks">
            <Text>12 Weeks</Text>
          </TabsTrigger>
          <TabsTrigger value="All Time">
            <Text>All Time</Text>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="1 Week">
          <ProgressComponent value="1 Week" />
        </TabsContent>
        <TabsContent value="4 Weeks">
          <ProgressComponent value="4 Weeks" />
        </TabsContent>
        <TabsContent value="12 Weeks">
          <ProgressComponent value="12 Weeks" />
        </TabsContent>
        <TabsContent value="All Time">
          <ProgressComponent value="All Time" />
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}
