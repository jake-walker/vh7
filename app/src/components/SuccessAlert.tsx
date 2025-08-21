import { useClipboard } from '@mantine/hooks';
import { Alert, Text, Popover, Button, Group, Space, type AlertProps } from '@mantine/core';
import { CheckCircle } from 'react-feather';
import { AwesomeQRCode } from "@awesomeqr/react";
import type { AnyShortLinkApiResponse } from '../types';
import { idToUrl } from '../controller';

export function SuccessAlert({ response, clear, ...props }: { response: AnyShortLinkApiResponse, clear: () => void } & AlertProps) {
  const clipboard = useClipboard({ timeout: 500 });

  const url = idToUrl(response.id);

  return (
    <Alert id="success-alert" icon={<CheckCircle size={32} />} title="Shortened!" color="green" withCloseButton onClose={clear} {...props}>
      <Text inherit>
        Your URL has been shortened to {' '}
        <Text
          inherit
          component="code"
          style={(theme) => ({
            fontFamily: theme.fontFamilyMonospace,
            fontWeight: 'bold'
          })}
        >
          {url}
        </Text>
      </Text>
      <Space h="sm" />
      <Group gap="xs">
        <Button color="green" onClick={() => clipboard.copy(url)}>
          {clipboard.copied ? 'Copied' : 'Copy'}
        </Button>
        <Popover shadow="md" position="bottom" withArrow withinPortal={true}>
          <Popover.Target>
            <Button variant="subtle" color="green">
              Show QR
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
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
                }
              }} />
            </div>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Alert>
  )
}
