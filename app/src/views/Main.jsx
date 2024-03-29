import { Box, Center, Container, Space, Tabs, Text, Title } from '@mantine/core';
import { SuccessAlert } from "../components/SuccessAlert";
import { ErrorAlert } from "../components/ErrorAlert";
import { ShortenForm } from "../components/ShortenForm";
import { PasteForm } from "../components/PasteForm";
import { UploadForm } from "../components/UploadForm";
import { useState } from "react";
import { Clipboard, File, Link } from 'react-feather';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { addItem } from '../slices/history';
import { HistoryItem } from '../components/HistoryItem';
import Header from '../components/Header';

function Main() {
  const history = useSelector(state => state.history.items);
  const dispatch = useDispatch();

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const onResponse = (res) => {
    dispatch(addItem(res));
    setResponse(res);
    setError(null);
  }

  const onError = (err) => {
    setResponse(null);
    setError(err);
  }

  return (
    <>
      <Header/>
      <Container my={20}>
        {response && <SuccessAlert response={response} clear={() => setResponse(null)} my={15} />}
        {error && <ErrorAlert error={error} clear={() => setError(null)} my={15} />}

        <Tabs variant="pills" defaultValue="shorten">
          <Tabs.List>
            <Tabs.Tab value="shorten" icon={<Link size={16} />}>Shorten</Tabs.Tab>
            <Tabs.Tab value="paste" icon={<Clipboard size={16} />}>Paste</Tabs.Tab>
            <Tabs.Tab value="upload" icon={<File size={16} />}>Upload</Tabs.Tab>
          </Tabs.List>

          <Space h="sm" />

          <Tabs.Panel value="shorten">
            <ShortenForm onResponse={(res) => onResponse(res)} onError={onError} />
          </Tabs.Panel>
          <Tabs.Panel value="paste">
            <PasteForm onResponse={(res) => onResponse(res)} onError={onError} />
          </Tabs.Panel>
          <Tabs.Panel value="upload">
            <UploadForm onResponse={(res) => onResponse(res)} onError={onError} />
          </Tabs.Panel>
        </Tabs>

        <Box mt={30}>
          <Title order={3} mb={10}>History</Title>
          {history.map((item, i) => <HistoryItem key={i} item={item} />).reverse()}
        </Box>
      </Container>
    </>
  );
}

export default Main;
