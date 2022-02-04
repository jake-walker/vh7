import { Alert, AlertIcon, Box, AlertTitle, AlertDescription, CloseButton } from '@chakra-ui/react';

export function ErrorAlert({ error, clear }) {
  return (
    <Alert status="error" my={4}>
      <AlertIcon/>
      <Box flex="1">
        <AlertTitle>Something has gone wrong!</AlertTitle>
        <AlertDescription display="block">
          {error}
        </AlertDescription>
      </Box>
      <CloseButton position="absolute" right="8px" top="8px" onClick={clear} />
    </Alert>
  )
}
