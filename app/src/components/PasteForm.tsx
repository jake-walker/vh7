import { Button, LoadingOverlay, Select, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Send } from "react-feather";
import { z } from "zod";
import languages from "../../../languages.json";
import { initialValues, validationRules } from "../advanced-controls";
import type { operations } from "../api.g";
import { paste, zodFormValidator } from "../controller";
import type { CreateFormProps } from "../types";
import { AdvancedControls, type AdvancedControlsFormValues } from "./AdvancedControls";
import { CreateInfo } from "./CreateInfo";

type PasteFormValues = {
  code: string;
  language:
  | NonNullable<NonNullable<operations["postApiPaste"]["requestBody"]>["content"]["application/json"]["language"]>
  | "";
} & AdvancedControlsFormValues;

export function PasteForm({ onResponse, onError }: CreateFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<PasteFormValues>({
    initialValues: {
      code: "",
      language: "",
      ...initialValues,
    },
    validate: {
      code: zodFormValidator(z.string()),
      language: zodFormValidator(
        z
          .string()
          .nullable()
          .refine((val) => val === null || val === "" || languages.map((lang) => lang.id).includes(val)),
      ),
      ...validationRules,
    },
  });

  const submit = async (values: PasteFormValues) => {
    onError(null);
    setLoading(true);

    try {
      const res = await paste(
        values.code,
        values.language === "" ? null : values.language,
        values.expireDays,
        values.deletable || false,
      );
      onResponse(res);
      form.reset();
    } catch (err) {
      onError(`Failed to paste: ${err}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(submit)} style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
      <Textarea
        id="paste-code"
        required
        label="Code"
        placeholder="print('Hello World')"
        autosize
        minRows={10}
        styles={(theme) => ({
          input: {
            fontFamily: theme.fontFamilyMonospace,
            paddingTop: 8,
            paddingBottom: 8,
          },
        })}
        {...form.getInputProps("code")}
      />
      {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
      <Select
        id="paste-language"
        label="Language"
        data={[{ label: "None", value: "" }, ...languages.map((lang) => ({ label: lang.name, value: lang.id }))]}
        {...form.getInputProps("language")}
      />
      <AdvancedControls form={form} />
      <CreateInfo form={form} type="paste" />
      {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
      <Button id="paste-submit" type="submit" mt={10} leftSection={<Send size={16} />}>
        Paste
      </Button>
    </form>
  );
}
