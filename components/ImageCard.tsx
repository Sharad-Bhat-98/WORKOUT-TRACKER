import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Image, View } from 'react-native';
import { ImageDeleteCardType } from '@/types/types';

export default function ImageCard({
  title,
  handlePress,
  imageData,
  description,
  footer,
}: ImageDeleteCardType) {
  return (
    <Card className="flex-row items-center justify-between px-2">
      <View className="ml-4 rounded-md bg-primary p-1">
        <Image
          source={{ uri: `data:image/png;base64,${imageData}` }}
          style={{ width: 70, height: 70 }}
        />
      </View>
      <CardHeader className="flex-1">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {footer}
    </Card>
  );
}
