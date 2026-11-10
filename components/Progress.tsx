import { View } from 'react-native';
import { Text } from './ui/text';

export default function ProgressComponent({ value }: { value: string }) {
  return (
    <View>
      <Text>{value}</Text>
    </View>
  );
}
