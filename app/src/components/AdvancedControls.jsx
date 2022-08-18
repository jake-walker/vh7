import { Collapse, PasswordInput, Select, Text } from "@mantine/core";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";
import { z } from 'zod';

export const initialValues = {
  expireDays: "60"
}

export const validationRules = {
  expireDays: (value) => z.string().refine((val) => {
    try {
      const n = parseInt(val);
      return (n > 0 && n < 365) || n == -1;
    } catch {
      return false;
    }
  }).safeParse(value).success
}

export function AdvancedControls({ form }) {
  const [opened, setOpened] = useState(false);

  const dates = [1, 7, 30, 60, 90, -1].map((days) => {
    if (days === -1) return {
      value: days.toString(),
      label: "Never"
    };
    const date = new Date();
    date.setDate(date.getDate() + days);
    return {
      value: days.toString(),
      label: `in ${days} day${(days > 1) ? 's' : ''}`
    }
  })

  return (
    <>
      <Collapse in={opened}>
        <Select label="Expires" data={dates} {...form.getInputProps('expireDays')} />
      </Collapse>
      <Text size="sm" component="a" color="dimmed" variant="link" sx={{ cursor: "pointer" }} onClick={() => setOpened(!opened)}>
        {opened ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        {opened ? 'Hide' : 'Show'} Advanced
      </Text>
    </>
  )
}
