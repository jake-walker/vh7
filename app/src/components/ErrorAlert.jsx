import { Alert } from "@mantine/core";
import { AlertOctagon } from "react-feather";

export function ErrorAlert({ error, clear, ...props }) {
  return (
    <Alert icon={<AlertOctagon size={32} />} title="Something has gone wrong!" color="red" withCloseButton onClose={clear} {...props}>
      {error}
    </Alert>
  )
}
