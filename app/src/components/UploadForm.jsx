import { Formik, Field, Form } from "formik";
import { FormControl, FormLabel, Input, FormErrorMessage, Center, Button } from '@chakra-ui/react';
import { upload } from "../controller";

export function UploadForm({ onResponse, onError }) {
  const submit = async (values, actions) => {


    onError(null);

    try {
      const res = await upload(values.file);
      onResponse(res);
      actions.resetForm();
    } catch (err) {
      onError("Failed to upload: " + err.message);
    }

    actions.setSubmitting(false);
  }

  return (
    <Formik initialValues={{ file: '' }} onSubmit={submit}>
      {(props) => (
        <Form style={{ width: '100%' }}>
          <Field name="file">
            {({ form }) => (
              <FormControl isInvalid={form.errors.file && form.touched.file}>
                <FormLabel htmlFor="file">File</FormLabel>
                <Input type="file" id="file" placeholder="print('Hello World')" onChange={(event) => {
                  props.setFieldValue('file', event.currentTarget.files[0]);
                }}/>
                <FormErrorMessage>{form.errors.file}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Center>
            <Button mt={4} colorScheme="green" isLoading={props.isSubmitting} type="submit">
              Upload!
            </Button>
          </Center>
        </Form>
      )}
    </Formik>
  )
}
