import { z } from 'zod'
import { paste } from "../controller";
import { useForm } from "@mantine/hooks";
import { useState } from 'react';
import { Button, LoadingOverlay, Select, Textarea } from '@mantine/core';
import { Send } from 'react-feather';
import { AdvancedControls, initialValues, validationRules } from './AdvancedControls';
import { CreateInfo } from './CreateInfo';
import languages from '../../../languages.json';

export function PasteForm({ onResponse, onError }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      code: '',
      language: null,
      ...initialValues
    },
    validationRules: {
      code: (value) => z.string().safeParse(value).success,
      language: (value) => z.string().refine((val) => languages.map((lang) => lang.id).includes(val)).safeParse(value).success,
      ...validationRules
    }
  });

  const submit = async (values) => {
    onError(null);
    setLoading(true);

    if (values.language === '') {
      values.language = null;
    }

    try {
      const res = await paste(values.code, values.language, values.expireDays);
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
      <Select label="Language" data={[
          { label: "None", value: null },
          ...languages.map((lang) => ({ label: lang.name, value: lang.id }))
        ]} {...form.getInputProps('language')} />
      <AdvancedControls form={form} />
      <CreateInfo form={form} type="paste" />
      <Button type="submit" mt={10} leftIcon={<Send size={16}/>}>Paste</Button>
    </form>
  )
}
