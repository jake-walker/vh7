import { useState } from "react";
import { upload } from "../controller";
import { Dropzone } from '@mantine/dropzone';
import { Alert, Group, Text } from "@mantine/core";
import { Info, Upload } from "react-feather";
import { useForm } from "@mantine/form";
import { AdvancedControls, initialValues, validationRules } from "./AdvancedControls";
import { CreateInfo } from "./CreateInfo";

export function UploadForm({ onResponse, onError }) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues,
    validationRules
  });

  const onDrop = async (files) => {
    form.validate();
    if (form.errors.expireDays || form.errors.password) {
      onError("Invalid expiry or password");
      return;
    }

    onError(null);
    setLoading(true);

    try {
      const res = await upload(files[0], form.values.expireDays);
      onResponse(res);
    } catch (err) {
      onError("Failed to upload: " + err.message);
    }

    setLoading(false);
  }

  const onReject = (files) => {
    onError("Failed to upload: " + files.map((file) => file.errors.map((error) => error.message).join(", ")).join(", ") + ".");
  }

  return (
    <>
      <Alert icon={<Info size={32} />} color="blue" mb="sm">
        Uploaded files last a maximum of 30 days.
      </Alert>
      <Dropzone
        id="upload-file"
        onDrop={onDrop}
        onReject={onReject}
        maxSize={2.56e+8}
        multiple={false}
        loading={loading}
      >
        <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
          <Upload size={64} />
          <div>
            <Text size="xl" inline>
              Drag files here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Files should not exceed 256 MB.
            </Text>
          </div>
        </Group>
      </Dropzone>
      <AdvancedControls form={form} />
      <CreateInfo form={form} type="upload" />
    </>
  )
}
