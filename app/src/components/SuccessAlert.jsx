import { useClipboard } from '@mantine/hooks';
import { Alert, Text } from '@mantine/core';
import { CheckCircle } from 'react-feather';
import urljoin from 'url-join';
import { baseURL } from '../controller';

export function SuccessAlert({ response, clear, ...props }) {
  const clipboard = useClipboard({ timeout: 500 });

  const url = urljoin(baseURL, response.id);

  return (
    <Alert icon={<CheckCircle size={32} />} title="Shortened!" color="green" withCloseButton onClose={clear} {...props}>
      Your URL has been shortened to {' '}
      <Text
        variant="link"
        component="span"
        size="sm"
        onClick={() => clipboard.copy(url)}
        color={clipboard.copied ? 'green' : 'blue'}
      >
        {url}
      </Text>
      {' '}
      <Text
        component="span"
        size="xs"
        color="dimmed"
      >
        {clipboard.copied ? '(copied)' : '(click to copy)'}
      </Text>
    </Alert>
  )
}
