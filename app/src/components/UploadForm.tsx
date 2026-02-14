import { Group, Text } from "@mantine/core";
import { Dropzone, type FileRejection, type FileWithPath } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Upload } from "react-feather";
import { initialValues, validationRules } from "../advanced-controls";
import { upload } from "../controller";
import type { CreateFormProps } from "../types";
import { AdvancedControls, type AdvancedControlsFormValues } from "./AdvancedControls";
import { CreateInfo } from "./CreateInfo";

type UploadFormValues = {} & AdvancedControlsFormValues;

export function UploadForm({ onResponse, onError }: CreateFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<UploadFormValues>({
    initialValues: {
      ...initialValues,
      expireDays: "30",
    },
    validate: {
      ...validationRules,
    },
  });

  const onDrop = async (files: FileWithPath[]) => {
    form.validate();
    if (form.errors.expireDays || form.errors.password) {
      onError("Invalid expiry or password");
      return;
    }

    if (files.length < 0) {
      onError("No files uploaded");
      return;
    }

    onError(null);
    setLoading(true);

    try {
      // biome-ignore lint/style/noNonNullAssertion: this is checked above
      const res = await upload(files[0]!, form.values.expireDays, form.values.deletable || false, form.values.linkType);
      onResponse(res);
    } catch (err) {
      onError(`Failed·to·upload:·${err}`);
    }

    setLoading(false);
  };

  const onReject = (files: FileRejection[]) => {
    onError(
      `Failed·to·upload:·${files.map((file) => file.errors.map((error) => error.message).join(", ")).join(", ")}.`,
    );
  };

  return (
    <>
      {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
      <Dropzone
        id="upload-file"
        onDrop={onDrop}
        onReject={onReject}
        maxSize={2.56e8}
        multiple={false}
        loading={loading}
      >
        <Group gap="xl" justify="center" style={{ minHeight: 220, pointerEvents: "none" }}>
          <Upload size={64} />
          <div>
            <Text size="xl" inline>
              Drag files here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Files should not exceed 256 MB.
            </Text>
          </div>
        </Group>
      </Dropzone>
      <AdvancedControls form={form} maxDays={30} />
      <CreateInfo form={form} type="upload" />
    </>
  );
}
