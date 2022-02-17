import { Center, Container, Tabs, Text, Title } from '@mantine/core';
import { SuccessAlert } from "./components/SuccessAlert";
import { ErrorAlert } from "./components/ErrorAlert";
import { ShortenForm } from "./components/ShortenForm";
import { PasteForm } from "./components/PasteForm";
import { UploadForm } from "./components/UploadForm";
import { useState } from "react";
import { Clipboard, File, Link } from 'react-feather';

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  return (
    <Container my={20}>
      <Center>
        <Title order={1} sx={{ fontSize: 100 }} my={50}>
          <Text
            inherit
            component="span"
            variant="gradient"
            gradient={{ from: "brand", to: "brand2", deg: 135 }}
          >
            VH7
          </Text>
        </Title>
      </Center>

      {response && <SuccessAlert response={response} clear={() => setResponse(null)} my={15} />}
      {error && <ErrorAlert error={error} clear={() => setError(null)} my={15} />}

      <Tabs variant="pills" tabPadding="lg">
        <Tabs.Tab label="Shorten" icon={<Link size={16} />}>
          <ShortenForm onResponse={(res) => {
            setResponse(res)
            setError(null)
          }} onError={(err) => {
            setResponse(null)
            setError(err)
          }} />
        </Tabs.Tab>
        <Tabs.Tab label="Paste" icon={<Clipboard size={16} />}>
          <PasteForm onResponse={(res) => {
            setResponse(res)
            setError(null)
          }} onError={(err) => {
            setResponse(null)
            setError(err)
          }} />
        </Tabs.Tab>
        <Tabs.Tab label="Upload" icon={<File size={16} />}>
          <UploadForm onResponse={(res) => {
            setResponse(res)
            setError(null)
          }} onError={(err) => {
            setResponse(null)
            setError(err)
          }} />
        </Tabs.Tab>
      </Tabs>
    </Container>
  );
}

export default App;
