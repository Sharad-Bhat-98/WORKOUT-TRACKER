import { Text } from '@/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { matchFont } from '@shopify/react-native-skia';
import type { TriggerRef } from '@rn-primitives/tooltip';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
  type CurveType,
  type PointsArray,
} from 'victory-native';

type InputFieldType = string | number;
type MaybeNumber = number | null | undefined;

type InputKey<T> = Extract<
  { [K in keyof T]-?: T[K] extends InputFieldType ? K : never }[keyof T],
  string
>;

type NumericKey<T> = Extract<
  { [K in keyof T]-?: T[K] extends MaybeNumber ? K : never }[keyof T],
  string
>;

type SeriesColor<YK extends string> = string | string[] | Partial<Record<YK, string>>;

type LineChartProps<T extends Record<string, unknown>> = {
  data: T[];
  xKey: InputKey<T>;
  yKeys: NumericKey<T>[];
  color?: SeriesColor<NumericKey<T>>;
  strokeWidth?: number;
  curveType?: CurveType;
  className?: string;
};

function toSkiaColor(color: string) {
  return color.replace(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/gi, 'hsl($1, $2%, $3%)');
}

function fadeColor(color: string, alpha: number) {
  const skiaColor = toSkiaColor(color);
  const channels = skiaColor.match(/^hsl\((.+)\)$/i);
  if (!channels) return skiaColor;
  return `hsla(${channels[1]}, ${alpha})`;
}

function formatChartValue(value: number | string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function ChartTooltip({
  active,
  xValue,
  xPosition,
  yKeys,
  yValues,
  yPositions,
  xKey,
}: {
  active: SharedValue<boolean>;
  xValue: SharedValue<number>;
  xPosition: SharedValue<number>;
  yKeys: readonly string[];
  yValues: SharedValue<number>[];
  yPositions: SharedValue<number>[];
  xKey: string;
}) {
  const [tip, setTip] = useState<string | null>(null);
  const triggerRef = useRef<TriggerRef>(null);

  useAnimatedReaction(
    () => {
      if (!active.value || yKeys.length === 0) return null;
      const parts = [String(xValue.value), String(xPosition.value), String(yPositions[0]?.value ?? 0)];
      for (let i = 0; i < yKeys.length; i++) {
        parts.push(`${yKeys[i]}\u001f${yValues[i]?.value ?? ''}`);
      }
      return parts.join('\u001e');
    },
    (value) => {
      scheduleOnRN(setTip, value);
    }
  );

  useEffect(() => {
    if (!tip) {
      triggerRef.current?.close();
      return;
    }
    triggerRef.current?.open();
  }, [tip]);

  const [rawX = '', rawLeft = '0', rawTop = '0', ...rawRows] = tip?.split('\u001e') ?? [];
  const left = Number(rawLeft);
  const top = Number(rawTop);
  const anchor = 12;

  return (
    <Tooltip pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <TooltipTrigger
        ref={triggerRef}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: left - anchor / 2,
          top: top - anchor / 2,
          width: anchor,
          height: anchor,
        }}
      />
      <TooltipContent side={top > 72 ? 'top' : 'bottom'} closeOnPress={false}>
        <Text>
          {xKey}: {formatChartValue(Number.isNaN(Number(rawX)) ? rawX : Number(rawX))}
        </Text>
        {rawRows.map((row) => {
          const [key, value = ''] = row.split('\u001f');
          const numeric = Number(value);
          return (
            <Text key={key}>
              {key}: {formatChartValue(Number.isNaN(numeric) ? value : numeric)}
            </Text>
          );
        })}
      </TooltipContent>
    </Tooltip>
  );
}

function seriesColor<YK extends string>(
  color: SeriesColor<YK> | undefined,
  key: YK,
  index: number,
  fallback: readonly string[]
) {
  if (typeof color === 'string') return toSkiaColor(color);
  if (Array.isArray(color)) return toSkiaColor(color[index] ?? fallback[index % fallback.length]);
  if (color?.[key]) return toSkiaColor(color[key]);
  return toSkiaColor(fallback[index % fallback.length]);
}

export default function LineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  yKeys,
  color,
  strokeWidth = 3,
  curveType,
  className,
}: LineChartProps<T>) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const fallback = [
    palette.primary,
    palette.chart1,
    palette.chart2,
    palette.chart3,
    palette.chart4,
  ];
  const font = matchFont({
    fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
    fontSize: 12,
  });
  const fontColor = colorScheme === 'dark' ? 'white' : 'black';
  const gridColor = fadeColor(palette.mutedForeground, 0.35);
  const { state } = useChartPressState({
    x: 0,
    y: Object.fromEntries(yKeys.map((key) => [key, 0])),
  });
  const yValueSvs = yKeys.map((key) => state.y[key].value);
  const yPositionSvs = yKeys.map((key) => state.y[key].position);

  return (
    <View className={cn('min-h-[200px] flex-1', className)}>
      <CartesianChart
        data={data}
        xKey={xKey as never}
        yKeys={yKeys as never}
        padding={{ left: 5, right: 5, top: 5, bottom: 5 }}
        chartPressState={state as never}
        chartPressConfig={{ pan: { activateAfterLongPress: 0 } }}
        axisOptions={{ font, labelColor: fontColor, lineColor: gridColor, lineWidth: 1 }}>
        {({ points }) => (
          <>
            {yKeys.flatMap((key, index) => {
              const seriesPoints = (points as Record<NumericKey<T>, PointsArray>)[key];
              const series = seriesColor(color, key, index, fallback);
              return [
                <Line
                  key={`${key}-line`}
                  points={seriesPoints}
                  color={series}
                  strokeWidth={strokeWidth}
                  curveType={curveType}
                />,
                <Scatter key={`${key}-points`} points={seriesPoints} radius={5} color={series} />,
              ];
            })}
          </>
        )}
      </CartesianChart>
      <ChartTooltip
        active={state.isActive}
        xValue={state.x.value}
        xPosition={state.x.position}
        yKeys={yKeys}
        yValues={yValueSvs}
        yPositions={yPositionSvs}
        xKey={xKey}
      />
    </View>
  );
}
