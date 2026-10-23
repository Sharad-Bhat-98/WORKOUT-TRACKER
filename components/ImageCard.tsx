import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Image, View } from 'react-native';
import { ImageDeleteCardType } from '@/types/types';
import { cn } from '@/lib/utils';

export default function ImageCard({
  title,
  imageData,
  description,
  footer,
  className = '',
}: ImageDeleteCardType) {
  return (
    <Card className={cn('flex-row items-center px-2', className)}>
      <View className="ml-4 rounded-md bg-primary p-1">
        <Image
          source={{ uri: `data:image/png;base64,${imageData}` }}
          style={{ width: 70, height: 70 }}
        />
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <View className="flex-row items-center">
          <CardHeader className="min-w-0 flex-1 px-3">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          {footer}
        </View>
        <View className="w-full px-3">
          {typeof description === 'string' ? (
            <CardDescription>{description}</CardDescription>
          ) : (
            description
          )}
        </View>
      </View>
    </Card>
  );
}
