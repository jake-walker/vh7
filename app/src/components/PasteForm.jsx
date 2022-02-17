import { z } from 'zod'
import { paste } from "../controller";
import { useForm } from "@mantine/hooks";
import { useState } from 'react';
import { Button, LoadingOverlay, Textarea } from '@mantine/core';
import { Send } from 'react-feather';

export function PasteForm({ onResponse, onError }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      code: ''
    },
    validationRules: {
      code: (value) => z.string().safeParse(value).success
    }
  });

  const submit = async (values) => {
    onError(null);
    setLoading(true);

    if (values.language === '') {
      values.language = null;
    }

    try {
      const res = await paste(values.code, values.language);
      onResponse(res);
      form.reset();
    } catch (err) {
      onError("Failed to paste: " + err.message);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(submit)} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Textarea
        required
        label="Code"
        placeholder="print('Hello World')"
        autosize
        minRows={10}
        styles={(theme) => ({
          input: {
            fontFamily: theme.fontFamilyMonospace,
          }
        })}
        {...form.getInputProps('code')}
      />
      <Button type="submit" mt={10} leftIcon={<Send size={16}/>}>Paste</Button>
    </form>
  )
}
