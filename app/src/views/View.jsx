import { Container, Title, Text, Box, Button, Alert } from "@mantine/core";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import { info as getInfo, shortUrl, baseURL } from '../controller';
import NotFound from "./NotFound";
import { Prism } from "@mantine/prism";
import { AlertOctagon, Download } from "react-feather";
import TimedRedirect from "../components/TimedRedirect";

function View() {
  const { link } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getInfo(link)
      .then((data) => setData(data))
      .catch((err) => {
        if (err.response && err.response.status == 404) {
          setData(false);
        } else {
          setData({ error: err });
        }
      });
  }, []);

  if (data === false) {
    return <NotFound
      title="That short link was not found."
      description="The short link you are trying to visit does not exist or has expired."
      />;
  }

  let title;
  let subtitle;
  let content;

  if (data !== null) {
    if (data.error) {
      title = "Something has gone wrong!";
      content = <Text mt={6}>Error: {data.error.message}. Please try again.</Text>;
    } else {
      switch (data.type) {
        case "url:1":
          title = shortUrl(data.data.url, 30);
          content = <>
            <TimedRedirect href={data.data.url} />
          </>;
          break;
        case "paste:1":
          title = "Paste";
          content = <>
            <Prism language={data.data.language}>{data.data.code}</Prism>
            <Button
              leftIcon={<Download size={16} />}
              component="a"
              href={`${baseURL}${link}?direct=1`}
              mt={10}
            >
              Download
            </Button>
          </>;
          break;
        case "upload:1":
          title = data.data.filename;
          let size = `${data.data.size} bytes`;
          if (data.data.size > 1000000) {
            size = `${(data.data.size / 1000000).toFixed(1)} MB`
          } else if (data.data.size > 1000) {
            size = `${(data.data.size / 1000).toFixed(1)} KB`
          }

          content = <>
            <Alert icon={<AlertOctagon size={32} />} color="red">
              Please note, files uploaded to VH7 are not checked for malware.
              Be cautious if downloading files from someone you do not know.
            </Alert>

            <Text style={{ overflowX: "auto" }}>
              <ul>
                <li><b>SHA256 Hash:</b> {data.data.hash}</li>
                <li><b>File Size:</b> {size}</li>
              </ul>
            </Text>

            <Button
              leftIcon={<Download size={16} />}
              component="a"
              href={`${baseURL}${link}?direct=1`}
            >
              Download {data.data.filename}
            </Button>
          </>;
          break;
      }
      subtitle = `Created ${(new Date(data.created).toLocaleDateString())}`;
    }
  }

  return (
    <>
      <Header small />
      <Container my={20}>
        <Title order={2}>{title}</Title>
        {subtitle && <Text color="dimmed">{subtitle}</Text>}

        <Box my={16}>
          {content}
        </Box>
      </Container>
    </>
  )
}

export default View;
