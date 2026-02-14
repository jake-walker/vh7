import { Box, Container, Space, Tabs, Title } from "@mantine/core";
import { useState } from "react";
import { Clipboard, File, Link } from "react-feather";
import { useDispatch } from "react-redux";
import { ErrorAlert } from "../components/ErrorAlert";
import Header from "../components/Header";
import { HistoryItem } from "../components/HistoryItem";
import { PasteForm } from "../components/PasteForm";
import { ShortenForm } from "../components/ShortenForm";
import { SuccessAlert } from "../components/SuccessAlert";
import { UploadForm } from "../components/UploadForm";
import { useAppSelector } from "../hooks";
import { addItem } from "../slices/history";
import type { AnyApiResponseHandler, AnyShortLinkApiResponse, ApiErrorHandler } from "../types.d";

function Main() {
  const history = useAppSelector((state) => state.history.items);
  const dispatch = useDispatch();

  const [response, setResponse] = useState<AnyShortLinkApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onResponse: AnyApiResponseHandler = (res) => {
    dispatch(addItem(res));
    setResponse(res);
    setError(null);
  };

  const onError: ApiErrorHandler = (err) => {
    setResponse(null);
    setError(err);
  };

  return (
    <>
      <Header />
      <Container my={20}>
        {response && <SuccessAlert response={response} clear={() => setResponse(null)} my={15} />}
        {error && <ErrorAlert error={error} clear={() => setError(null)} my={15} />}

        <Tabs variant="pills" defaultValue="shorten">
          <Tabs.List>
            <Tabs.Tab value="shorten" leftSection={<Link size={16} />}>
              Shorten
            </Tabs.Tab>
            <Tabs.Tab value="paste" leftSection={<Clipboard size={16} />}>
              Paste
            </Tabs.Tab>
            <Tabs.Tab value="upload" leftSection={<File size={16} />}>
              Upload
            </Tabs.Tab>
          </Tabs.List>

          <Space h="sm" />

          <Tabs.Panel value="shorten">
            <ShortenForm onResponse={onResponse} onError={onError} />
          </Tabs.Panel>
          <Tabs.Panel value="paste">
            <PasteForm onResponse={onResponse} onError={onError} />
          </Tabs.Panel>
          <Tabs.Panel value="upload">
            <UploadForm onResponse={onResponse} onError={onError} />
          </Tabs.Panel>
        </Tabs>

        <Box mt={30}>
          <Title order={3} mb={10}>
            History
          </Title>
          {history.map((item) => <HistoryItem key={item.id} item={item} />).reverse()}
        </Box>
      </Container>
    </>
  );
}

export default Main;
