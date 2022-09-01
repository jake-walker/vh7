import { useClipboard } from '@mantine/hooks';
import { Alert, Text } from '@mantine/core';
import { CheckCircle } from 'react-feather';
import urljoin from 'url-join';
import { baseURL } from '../controller';

export function SuccessAlert({ response, clear, ...props }) {
  const clipboard = useClipboard({ timeout: 500 });

  const url = urljoin(baseURL, response.id);

  return (
    <Alert id="success-alert" icon={<CheckCircle size={32} />} title="Shortened!" color="green" withCloseButton onClose={clear} {...props}>
      Your URL has been shortened to {' '}
      <Text
        id="success-alert-link"
        variant="link"
        component="code"
        size="sm"
        onClick={() => clipboard.copy(url)}
        color={clipboard.copied ? 'green' : 'blue'}
        sx={(theme) => ({
          fontFamily: theme.fontFamilyMonospace,
        })}
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
