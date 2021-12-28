import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, Center, CloseButton, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, Link, useToast, Text } from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import { request } from 'graphql-request';
import * as Yup from 'yup';
import urljoin from 'url-join';
import config from './config';


const ShortenSchema = Yup.object().shape({
  url: Yup.string().url('URL must be valid').required('URL is required')
});

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const toast = useToast();

  async function submit(values, actions) {
    setError(null);

    try {
      const res = await request(config.apiUrl, config.mutations.newLink, {
        url: values.url,
      });
      setResponse(res);
      console.log(res);
      actions.resetForm();
    } catch (err) {
      setError("Failed to shorten: " + JSON.stringify(err));
    }

    actions.setSubmitting(false);
  }

  function copyToClipboard(id) {
    try {
      navigator.clipboard.writeText(urljoin(config.baseUrl, response.link._id));
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
    <>
      <Container>
        <Box my={30}>
          <Center py={10}>
            <Heading size="2xl">VH7</Heading>
          </Center>

          {response && <Alert status="success" my={4}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Shortened!</AlertTitle>
              <AlertDescription display="block">
                Your URL has been shortened to <Link onClick={copyToClipboard}>{urljoin(config.baseUrl, response.link._id)}</Link> <Text fontSize="xs" display="inline" color="gray">(click to copy)</Text>
              </AlertDescription>
            </Box>
            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setResponse(null)} />
          </Alert>}

          {error && <Alert status="error" my={4}>
            <AlertIcon/>
            <Box flex="1">
              <AlertTitle>Something has gone wrong!</AlertTitle>
              <AlertDescription display="block">
                {error}
              </AlertDescription>
            </Box>
            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError(null)} />
          </Alert>}

          <Formik initialValues={{ url: '' }} onSubmit={submit} validationSchema={ShortenSchema}>
            {(props) => (
              <Form style={{ width: '100%' }}>
                <Field name="url">
                  {({ field, form }) => (
                    <FormControl isInvalid={form.errors.url && form.touched.url}>
                      <FormLabel htmlFor="url">URL</FormLabel>
                      <Input {...field} id="url" placeholder="https://example.com/a/long/url" />
                      <FormErrorMessage>{form.errors.url}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Center>
                  <Button mt={4} colorScheme="purple" isLoading={props.isSubmitting} type="submit">
                    Shorten!
                  </Button>
                </Center>
              </Form>
            )}
          </Formik>
        </Box>
      </Container>
    </>
  );
}

export default App;
