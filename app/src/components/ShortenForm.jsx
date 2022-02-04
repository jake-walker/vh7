import { Formik, Field, Form } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Center, Button } from '@chakra-ui/react';
import * as Yup from 'yup';
import { shorten } from "../controller";

const ShortenSchema = Yup.object().shape({
  url: Yup.string().url('URL must be valid').required('URL is required')
});

export function ShortenForm({ onResponse, onError }) {
  const submit = async (values, actions) => {
    onError(null);

    try {
      const res = await shorten(values.url);
      onResponse(res);
      actions.resetForm();
    } catch (err) {
      onError("Failed to shorten: " + err.message);
    }

    actions.setSubmitting(false);
  }

  return (
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
            <Button mt={4} colorScheme="green" isLoading={props.isSubmitting} type="submit">
              Shorten!
            </Button>
          </Center>
        </Form>
      )}
    </Formik>
  )
}
