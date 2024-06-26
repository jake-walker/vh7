import { Collapse, PasswordInput, Select, Switch, Text } from "@mantine/core";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";
import { z } from 'zod';

export const initialValues = {
  expireDays: "60",
  deletable: true
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

export function AdvancedControls({ form, maxDays = null }) {
  const [opened, setOpened] = useState(false);

  const dates = [1, 7, 14, 30, 60, 90, -1]
    // remove days that are over the maximum if the maximum is set
    .filter((days) => maxDays != null ? days <= maxDays && days > 0 : true)
    .map((days) => {
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
    });

  return (
    <>
      <Collapse in={opened}>
        <Select label="Expires" data={dates} {...form.getInputProps('expireDays')} />
        <Switch label="Allow deletion?" mb="xs" {...form.getInputProps('deletable', { type: 'checkbox' })} />
      </Collapse>
      <Text size="sm" component="a" color="dimmed" variant="link" sx={{ cursor: "pointer" }} onClick={() => setOpened(!opened)}>
        {opened ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        {opened ? 'Hide' : 'Show'} Advanced
      </Text>
    </>
  )
}
