// components/EndSessionPicker.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import {
  Column,
  DateTimePicker as AndroidPicker,
  Host as AndroidHost,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, verticalScroll } from '@expo/ui/jetpack-compose/modifiers';

import { DatePicker, Host } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { SQLiteRunResult } from 'expo-sqlite';
// SQLite-friendly local format: YYYY-MM-DD HH:MM:SS
function toSqlDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

function parseSqlDate(s: string) {
  return new Date(s.replace(' ', 'T'));
}

export function EndSessionPicker({
  disabled,
  endedAt,
  handlePress,
}: {
  disabled: boolean;
  endedAt: string | null;
  handlePress: UseMutationResult<SQLiteRunResult, Error, string, unknown>;
}) {
  const [date, setDate] = useState<Date>(endedAt ? parseSqlDate(endedAt) : new Date());
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  // Dialog chrome (overlay inset + content padding). A numeric width gives the
  // Material date pager a finite max width; matchContents would measure it as Infinity.
  const dialogWidth = Math.min(windowWidth - 24, 420);
  const pickerWidth = dialogWidth - 24;
  const pickerHeight = Math.round(Math.min(windowHeight * 0.7, 640));
  return (
    <Dialog className="gap-3">
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>SET SESSION END TIME</Text>
        </Button>
      </DialogTrigger>

      {Platform.OS === 'ios' ? (
        <Host matchContents>
          <DatePicker
            selection={date}
            displayedComponents={['date', 'hourAndMinute']}
            onDateChange={setDate}
            modifiers={[datePickerStyle('compact')]} // compact = tap to open a popover
          />
        </Host>
      ) : (
        <DialogContent
          className="w-auto max-w-none gap-2 px-3 py-4"
          style={{ width: dialogWidth, maxWidth: dialogWidth }}>
          <AndroidHost style={{ width: pickerWidth, height: pickerHeight }}>
            <Column
              modifiers={[verticalScroll(), fillMaxWidth()]}
              verticalArrangement={{ spacedBy: 12 }}>
              <AndroidPicker
                initialDate={date.toISOString()}
                displayedComponents="date"
                variant="picker"
                modifiers={[fillMaxWidth()]}
                onDateSelected={(d) => {
                  // keep the current time, change only the date
                  const next = new Date(d);
                  next.setHours(date.getHours(), date.getMinutes(), 0, 0);
                  setDate(next);
                }}
              />
              <AndroidPicker
                initialDate={date.toISOString()}
                displayedComponents="hourAndMinute"
                variant="picker"
                modifiers={[fillMaxWidth()]}
                onDateSelected={(d) => {
                  const next = new Date(date);
                  next.setHours(d.getHours(), d.getMinutes(), 0, 0);
                  setDate(next);
                }}
              />
            </Column>
          </AndroidHost>
        </DialogContent>
      )}
      <Button disabled={disabled} onPress={() => handlePress.mutate(toSqlDate(date))}>
        <Text>{endedAt ? 'Update End Time' : 'End Session'}</Text>
      </Button>
    </Dialog>
  );
}
