import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { Platform, ScrollView, type TextInputProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { useRef } from 'react';
import { TriggerRef } from '@rn-primitives/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '@/lib/utils';

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

type TextFieldProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  label: string;
};

function FormTextField({ label, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();
  const form = useFormContext();

  const submissionAttempts = useSelector(form.store, (state) => state.submissionAttempts);

  const firstError = field.state.meta.errors[0];
  const error = typeof firstError === 'string' ? firstError : firstError?.message;

  const showError = Boolean(error) && (field.state.meta.isTouched || submissionAttempts > 0);

  return (
    <>
      <Text>{label}</Text>

      <Input
        {...props}
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        accessibilityLabel={label}
      />

      {showError ? <Text>{error}</Text> : null}
    </>
  );
}

function FormTextArea({ label, ...props }: TextFieldProps) {
  const field = useFieldContext<string>();
  const form = useFormContext();

  const submissionAttempts = useSelector(form.store, (state) => state.submissionAttempts);

  const firstError = field.state.meta.errors[0];
  const error = typeof firstError === 'string' ? firstError : firstError?.message;

  const showError = Boolean(error) && (field.state.meta.isTouched || submissionAttempts > 0);

  return (
    <>
      <Text>{label}</Text>

      <Textarea
        {...props}
        value={field.state.value}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        accessibilityLabel={label}
      />

      {showError ? <Text>{error}</Text> : null}
    </>
  );
}

type FormSelectProps = {
  label: string;
  items: string[];
  placeholder?: string;
};

function FormSelect({ label, items, placeholder = 'Select an option' }: FormSelectProps) {
  const ref = useRef<TriggerRef>(null);

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const field = useFieldContext<string>();
  const form = useFormContext();

  const submissionAttempts = useSelector(form.store, (state) => state.submissionAttempts);

  const firstError = field.state.meta.errors[0];
  const error = typeof firstError === 'string' ? firstError : firstError?.message;

  const showError = Boolean(error) && (field.state.meta.isTouched || submissionAttempts > 0);

  const selected = field.state.value
    ? { value: field.state.value, label: field.state.value }
    : undefined;

  return (
    <>
      <Text>{label}</Text>
      <Select
        value={selected}
        onValueChange={(option) => {
          field.handleChange(option?.value ?? '');
        }}
        onOpenChange={(open) => {
          if (!open) field.handleBlur();
        }}>
        <SelectTrigger ref={ref} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent insets={contentInsets}>
          <NativeSelectScrollView>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item} label={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </NativeSelectScrollView>
        </SelectContent>
      </Select>
      {showError ? <Text>{error}</Text> : null}
    </>
  );
}

/**
 * @platform Native only
 * Returns the children on the web
 */
function NativeSelectScrollView({ className, ...props }: React.ComponentProps<typeof ScrollView>) {
  if (Platform.OS === 'web') {
    return <>{props.children}</>;
  }
  return <ScrollView className={cn('max-h-52', className)} {...props} />;
}

function SubmitButton({ title }: { title: string }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.canSubmit && !state.isSubmitting}>
      {(canSubmit) => (
        <Button onPress={() => void form.handleSubmit()} disabled={!canSubmit}>
          <Text>{title}</Text>
        </Button>
      )}
    </form.Subscribe>
  );
}

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormTextField,
    FormTextArea,
    FormSelect,
  },
  formComponents: {
    SubmitButton,
  },
});
