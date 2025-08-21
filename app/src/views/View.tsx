import { Container, Title, Text, Box, Button, Alert } from "@mantine/core";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import Header from "../components/Header";
import { info as getInfo, idToUrl, shortUrl } from '../controller';
import NotFound from "./NotFound";
import { CodeHighlight } from "@mantine/code-highlight";
import { AlertOctagon, Download } from "react-feather";
import TimedRedirect from "../components/TimedRedirect";

function View() {
  const { link } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getInfo>> | null>(null);
  const [error, setError] = useState<any>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (link === undefined) return;

    getInfo(link)
      .then((data) => setData(data))
      .catch((err) => {
        if (err.response && err.response.status == 404) {
          setNotFound(true)
        } else {
          setError(error);
        }
      });
  }, [link]);

  if (notFound) {
    return <NotFound
      title="That short link was not found."
      description="The short link you are trying to visit does not exist or has expired."
    />;
  }

  let title;
  let subtitle;
  let content;

  if (data !== null) {
    if (error) {
      title = "Something has gone wrong!";
      content = <Text mt={6}>Error: {error.message}. Please try again.</Text>;
    } else {
      switch (data.type) {
        case "url":
          title = shortUrl(data.url);
          content = <>
            <TimedRedirect href={data.url} />
          </>;
          break;
        case "paste":
          title = "Paste";
          content = <>
            <CodeHighlight language={data.language ?? undefined} code={data.code} id="paste-content" />
            <Button
              leftSection={<Download size={16} />}
              component="a"
              href={`${idToUrl(link!)}?direct=1`}
              mt={10}
            >
              Download
            </Button>
          </>;
          break;
        case "upload":
          title = data.filename;
          let size = `${data.size} bytes`;
          if (data.size > 1000000) {
            size = `${(data.size / 1000000).toFixed(1)} MB`
          } else if (data.size > 1000) {
            size = `${(data.size / 1000).toFixed(1)} KB`
          }

          content = <>
            <Alert icon={<AlertOctagon size={32} />} color="red">
              Please note, files uploaded to VH7 are not checked for malware.
              Be cautious if downloading files from someone you do not know.
            </Alert>

            <Box style={{ overflowX: "auto" }}>
              <ul>
                <li><b>SHA256 Hash:</b> <span id="upload-sha256">{data.hash}</span></li>
                <li><b>File Size:</b> {size}</li>
              </ul>
            </Box>

            <Button
              leftSection={<Download size={16} />}
              component="a"
              href={`${idToUrl(link!)}?direct=1`}
            >
              Download {data.filename}
            </Button>
          </>;
          break;
      }
      subtitle = `Created ${(new Date(data.createdAt).toLocaleDateString())}`;
    }
  }

  return (
    <>
      <Header small />
      <Container my={20}>
        <Title order={2}>{title}</Title>
        {subtitle && <Text c="dimmed">{subtitle}</Text>}

        <Box my={16}>
          {content}
        </Box>
      </Container>
    </>
  )
}

export default View;
