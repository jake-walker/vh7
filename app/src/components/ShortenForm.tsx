import { useForm } from '@mantine/form';
import { shorten } from "../controller";
import { z } from 'zod';
import { Button, LoadingOverlay, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Send } from 'react-feather';
import { AdvancedControls, initialValues, validationRules, type AdvancedControlsFormValues } from './AdvancedControls';
import { CreateInfo } from './CreateInfo';
import type { CreateFormProps } from '../types';
import { zodFormValidator } from "../controller";

type ShortenFormValues = {
  url: string
} & AdvancedControlsFormValues;

export function ShortenForm({ onResponse, onError }: CreateFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ShortenFormValues>({
    initialValues: {
      url: '',
      ...initialValues
    },
    validate: {
      url: zodFormValidator(z.url()),
      ...validationRules
    }
  });

  const submit = async (values: ShortenFormValues) => {
    onError(null);
    setLoading(true);

    try {
      const res = await shorten(values.url, values.expireDays, values.deletable || false);
      onResponse(res);
      form.reset();
    } catch (err) {
      onError("Failed to shorten: " + err);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(submit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <TextInput id="shorten-url" required label="URL" placeholder="https://example.com/a/long/url" {...form.getInputProps('url')} />
      <AdvancedControls form={form} />
      <CreateInfo form={form} type="short link" />
      <Button id="shorten-submit" type="submit" mt={10} leftSection={<Send size={16} />}>Shorten</Button>
    </form>
  )
}
