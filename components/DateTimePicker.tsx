// components/EndSessionPicker.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import dayjs from '@/lib/dayjs';
import { UseMutationResult } from '@tanstack/react-query';
import { SQLiteRunResult } from 'expo-sqlite';
import { useState } from 'react';
import { Modal, Platform, Pressable, useWindowDimensions, View } from 'react-native';

import {
  DateTimePicker as AndroidPicker,
  Host as AndroidHost,
  Column,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, verticalScroll } from '@expo/ui/jetpack-compose/modifiers';
import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

// SQLite-friendly local format, seconds normalized
const SQL_FORMAT = 'YYYY-MM-DD HH:mm:00';

const toSqlDate = (d: Date) => dayjs(d).format(SQL_FORMAT);

const parseSqlDate = (s: string) => dayjs(s).toDate();

// Material's date picker works in UTC days. Send the local calendar day
// as UTC midnight.
const localDateToUtcDayISOString = (d: Date) =>
  dayjs.utc(dayjs(d).format('YYYY-MM-DD')).toISOString();

// Take the picked UTC day and keep the local time of day.
const applyUtcDay = (utcDay: Date, timeOfDay: Date) => {
  const day = dayjs.utc(utcDay);
  return dayjs(timeOfDay).year(day.year()).month(day.month()).date(day.date()).toDate();
};

const applyTime = (time: Date, prev: Date) =>
  dayjs(prev).hour(time.getHours()).minute(time.getMinutes()).second(0).millisecond(0).toDate();

type Props = {
  disabled: boolean;
  endedAt: string | null;
  startedAt?: string | null;
  endSession: UseMutationResult<SQLiteRunResult, Error, string, unknown>;
};

export function EndSessionPicker({ disabled, endedAt, startedAt, endSession }: Props) {
  const initial = () => (endedAt ? parseSqlDate(endedAt) : dayjs().second(0).toDate());

  const [date, setDate] = useState<Date>(initial);
  const [open, setOpen] = useState(false);
  const [initialISO, setInitialISO] = useState({ day: '', time: '' });

  const { width: w, height: h } = useWindowDimensions();
  // A numeric width gives the Material date pager a finite max width.
  const dialogWidth = Math.min(w - 24, 420);
  const pickerWidth = dialogWidth - 24;
  const pickerHeight = Math.round(Math.min(h * 0.6, 640));

  const isBeforeStart = !!startedAt && dayjs(date).isBefore(dayjs(startedAt));
  const isInFuture = dayjs(date).isAfter(dayjs());
  const error = isBeforeStart
    ? 'End time cannot be before the start time'
    : isInFuture
      ? 'End time cannot be in the future'
      : null;

  const submit = () => endSession.mutate(toSqlDate(date), { onSuccess: () => setOpen(false) });

  const openPicker = () => {
    const d = initial();
    setDate(d);
    setInitialISO({
      day: localDateToUtcDayISOString(d),
      time: d.toISOString(),
    });
    setOpen(true);
  };

  const footer = (
    <>
      {error && <Text className="text-sm text-destructive">{error}</Text>}
      <Button disabled={disabled || endSession.isPending || !!error} onPress={submit}>
        <Text>{endedAt ? 'Update End Time' : 'End Session'}</Text>
      </Button>
    </>
  );

  // iOS: the compact DatePicker is its own trigger and opens a popover
  if (Platform.OS === 'ios') {
    return (
      <>
        <Host matchContents>
          <DatePicker
            selection={date}
            displayedComponents={['date', 'hourAndMinute']}
            onDateChange={(d) => setDate(dayjs(d).second(0).toDate())}
            modifiers={[datePickerStyle('compact')]}
          />
        </Host>
        {footer}
      </>
    );
  }

  return (
    <>
      <Button variant="outline" onPress={openPicker}>
        <Text>SET SESSION END TIME</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 items-center justify-center">
          <Pressable className="absolute inset-0 bg-black/50" onPress={() => setOpen(false)} />
          <View
            className="gap-3 rounded-lg border border-border bg-background p-4"
            style={{ width: dialogWidth }}>
            <AndroidHost style={{ width: pickerWidth, height: pickerHeight }}>
              <Column
                modifiers={[verticalScroll(), fillMaxWidth()]}
                verticalArrangement={{ spacedBy: 12 }}>
                <AndroidPicker
                  initialDate={initialISO.day}
                  displayedComponents="date"
                  variant="input"
                  modifiers={[fillMaxWidth()]}
                  onDateSelected={(d) => {
                    d && setDate((prev) => applyUtcDay(d, prev));
                  }}
                />
                <AndroidPicker
                  initialDate={initialISO.time}
                  displayedComponents="hourAndMinute"
                  variant="input"
                  modifiers={[fillMaxWidth()]}
                  onDateSelected={(d) => d && setDate((prev) => applyTime(d, prev))}
                />
              </Column>
            </AndroidHost>
            {footer}
          </View>
        </View>
      </Modal>
    </>
  );
}
