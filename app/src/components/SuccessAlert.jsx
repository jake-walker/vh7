import { useClipboard } from '@mantine/hooks';
import { Alert, Text, HoverCard, Button, Group, Space } from '@mantine/core';
import { CheckCircle } from 'react-feather';
import { AwesomeQRCode } from "@awesomeqr/react";
import urljoin from 'url-join';
import { baseURL } from '../controller';

export function SuccessAlert({ response, clear, ...props }) {
  const clipboard = useClipboard({ timeout: 500 });

  const url = urljoin(baseURL, response.id);

  return (
    <Alert id="success-alert" icon={<CheckCircle size={32} />} title="Shortened!" color="green" withCloseButton onClose={clear} {...props}>
      <Text inherit>
        Your URL has been shortened to {' '}
        <Text
          inherit
          component="code"
          sx={(theme) => ({
            fontFamily: theme.fontFamilyMonospace,
            fontWeight: 'bold'
          })}
          >
          {url}
        </Text>
      </Text>
      <Space h="sm" />
      <Group spacing="xs">
        <Button color="green" onClick={() => clipboard.copy(url)}>
          {clipboard.copied ? 'Copied' : 'Copy'}
        </Button>
        <HoverCard shadow="md" withinPortal={true}>
          <HoverCard.Target>
            <Button variant="subtle" color="green">
              Show QR
            </Button>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <div style={{ width: '300px', height: '300px' }}>
              <AwesomeQRCode options={{
                text: url,
                autoColor: false,
                whiteMargin: true,
                margin: 40,
                components: {
                  data: { scale: 1 },
                  timing: { scale: 1, protectors: false },
                  alignment: { scale: 1, protectors: false },
                  cornerAlignment: { scale: 1, protectors: false }
                }}} />
            </div>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    </Alert>
  )
}
