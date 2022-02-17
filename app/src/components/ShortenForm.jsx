import { useForm } from '@mantine/hooks';
import { shorten } from "../controller";
import { z } from 'zod';
import { Button, LoadingOverlay, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Send } from 'react-feather';

export function ShortenForm({ onResponse, onError }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      url: ''
    },
    validationRules: {
      url: (value) => z.string().url().safeParse(value).success
    }
  })

  const submit = async (values) => {
    onError(null);
    setLoading(true);

    try {
      const res = await shorten(values.url);
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
      <TextInput required label="URL" placeholder="https://example.com/a/long/url" {...form.getInputProps('url')} />
      <Button type="submit" mt={10} leftIcon={<Send size={16} />}>Shorten</Button>
    </form>
  )
}
