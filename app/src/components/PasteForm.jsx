import { Formik, Field, Form } from "formik";
import { FormControl, FormLabel, FormErrorMessage, Center, Button, Textarea, Select } from '@chakra-ui/react';
import * as Yup from 'yup';
import languages from '../../../languages.json';
import { paste } from "../controller";

const PasteSchema = Yup.object().shape({
  code: Yup.string().required('Code is required'),
  languages: Yup.string().oneOf(languages.map((lang) => lang.id)).optional(),
});

export function PasteForm({ onResponse, onError }) {
  const submit = async (values, actions) => {
    onError(null);

    if (values.language === '') {
      values.language = null;
    }

    try {
      const res = await paste(values.code, values.language);
      onResponse(res);
      actions.resetForm();
    } catch (err) {
      onError("Failed to paste: " + err.message);
    }

    actions.setSubmitting(false);
  }

  return (
    <Formik initialValues={{ code: '', language: '' }} onSubmit={submit} validationSchema={PasteSchema}>
      {(props) => (
        <Form style={{ width: '100%' }}>
          <Field name="code">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.code && form.touched.code}>
                <FormLabel htmlFor="code">Code</FormLabel>
                <Textarea {...field} id="code" placeholder="print('Hello World')" />
                <FormErrorMessage>{form.errors.code}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="language">
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.language && form.touched.language}>
                <FormLabel htmlFor="language">Language</FormLabel>
                <Select {...field} id="language" placeholder="Autodetect">
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </Select>
                <FormErrorMessage>{form.errors.language}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Center>
            <Button mt={4} colorScheme="green" isLoading={props.isSubmitting} type="submit">
              Paste!
            </Button>
          </Center>
        </Form>
      )}
    </Formik>
  )
}
