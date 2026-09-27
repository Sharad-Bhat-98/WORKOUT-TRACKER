import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { type TextInputProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  },
  formComponents: {
    SubmitButton,
  },
});
