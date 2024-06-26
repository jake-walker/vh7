import { useForm } from '@mantine/form';
import { shorten } from "../controller";
import { z } from 'zod';
import { Button, LoadingOverlay, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Send } from 'react-feather';
import { AdvancedControls, initialValues, validationRules } from './AdvancedControls';
import { CreateInfo } from './CreateInfo';

export function ShortenForm({ onResponse, onError }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      url: '',
      ...initialValues
    },
    validationRules: {
      url: (value) => z.string().url().safeParse(value).success,
      ...validationRules
    }
  })

  const submit = async (values) => {
    onError(null);
    setLoading(true);

    try {
      const res = await shorten(values.url, values.expireDays, values.deletable || false);
      onResponse(res);
      form.reset();
    } catch (err) {
      onError("Failed to shorten: " + err.message);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(submit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <TextInput id="shorten-url" required label="URL" placeholder="https://example.com/a/long/url" {...form.getInputProps('url')} />
      <AdvancedControls form={form} />
      <CreateInfo form={form} type="short link" />
      <Button id="shorten-submit" type="submit" mt={10} leftIcon={<Send size={16} />}>Shorten</Button>
    </form>
  )
}
