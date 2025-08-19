import { useState } from "react";
import { upload } from "../controller";
import { Dropzone, type FileRejection, type FileWithPath } from '@mantine/dropzone';
import { Group, Text } from "@mantine/core";
import { Upload } from "react-feather";
import { useForm } from "@mantine/form";
import { AdvancedControls, initialValues, validationRules, type AdvancedControlsFormValues } from "./AdvancedControls";
import { CreateInfo } from "./CreateInfo";
import type { CreateFormProps } from "../types";

type UploadFormValues = {} & AdvancedControlsFormValues;

export function UploadForm({ onResponse, onError }: CreateFormProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<UploadFormValues>({
    initialValues: {
      ...initialValues,
      expireDays: "30"
    },
    validate: {
      ...validationRules
    }
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
      const res = await upload(files[0]!, form.values.expireDays, form.values.deletable || false);
      onResponse(res);
    } catch (err) {
      onError("Failed to upload: " + err);
    }

    setLoading(false);
  }

  const onReject = (files: FileRejection[]) => {
    onError("Failed to upload: " + files.map((file) => file.errors.map((error) => error.message).join(", ")).join(", ") + ".");
  }

  return (
    <>
      <Dropzone
        id="upload-file"
        onDrop={onDrop}
        onReject={onReject}
        maxSize={2.56e+8}
        multiple={false}
        loading={loading}
      >
        <Group gap="xl" justify="center" style={{ minHeight: 220, pointerEvents: 'none' }}>
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
  )
}
