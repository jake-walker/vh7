import { Box, Center, Container, Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { SuccessAlert } from "./components/SuccessAlert";
import { ErrorAlert } from "./components/ErrorAlert";
import { ShortenForm } from "./components/ShortenForm";
import { PasteForm } from "./components/PasteForm";
import { UploadForm } from "./components/UploadForm";
import { useState } from "react";

function App() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  return (
    <>
      <Container>
        <Box my={30}>
          <Center py={10}>
            <Heading
              size="2xl"
              bgGradient="linear(to-br, #38A169, #4299E1)"
              bgClip="text"
              fontWeight="extrabold"
            >
              VH7
            </Heading>
          </Center>

          {response && <SuccessAlert response={response} clear={() => setResponse(null)}/>}
          {error && <ErrorAlert error={error} clear={() => setError(null)}/>}

          <Tabs>
            <TabList>
              <Tab>Shorten</Tab>
              <Tab>Paste</Tab>
              <Tab>Upload</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ShortenForm onResponse={(res) => {
                  setResponse(res)
                  setError(null)
                }} onError={(err) => {
                  setResponse(null)
                  setError(err)
                }} />
              </TabPanel>
              <TabPanel>
                <PasteForm onResponse={(res) => {
                  setResponse(res)
                  setError(null)
                }} onError={(err) => {
                  setResponse(null)
                  setError(err)
                }} />
              </TabPanel>
              <TabPanel>
                <UploadForm onResponse={(res) => {
                  setResponse(res)
                  setError(null)
                }} onError={(err) => {
                  setResponse(null)
                  setError(err)
                }} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </>
  );
}

export default App;
