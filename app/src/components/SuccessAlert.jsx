import { Alert, AlertIcon, Box, AlertTitle, AlertDescription, CloseButton, useToast, Link, Text } from '@chakra-ui/react';
import urljoin from 'url-join';
import { baseURL } from '../controller';

export function SuccessAlert({ response, clear }) {
  const toast = useToast();

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(urljoin(baseURL, response.id));
      toast({
        title: "Copied to clipboard!",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error(error);
      toast({
        title: "Whoops!",
        description: "Failed to copy to clipboard.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Alert status="success" my={4}>
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Shortened!</AlertTitle>
        <AlertDescription display="block">
          Your URL has been shortened to <Link onClick={copyToClipboard}>{urljoin(baseURL, response.id)}</Link> <Text fontSize="xs" display="inline" color="gray">(click to copy)</Text>
        </AlertDescription>
      </Box>
      <CloseButton position="absolute" right="8px" top="8px" onClick={clear} />
    </Alert>
  )
}
