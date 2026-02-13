import { Alert, Box, Button, Container, Stack, Text, Title } from "@mantine/core";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { AlertOctagon, Calendar, Download } from "react-feather";
import { useParams } from "react-router";
import { googleCalendarUrl, outlookCalendarUrl } from "../calendarLinks";
import Header from "../components/Header";
import { LazyCodeHighlight } from "../components/LazyCodeHighlight";
import TimedRedirect from "../components/TimedRedirect";
import { info as getInfo, idToUrl, shortUrl } from "../controller";
import NotFound from "./NotFound";

function View() {
  const { link } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getInfo>> | null>(null);
  const [error, setError] = useState<any>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (link === undefined) return;

    getInfo(link)
      .then((data) => {
        if (data === null) {
          setNotFound(true);
        } else {
          setData(data);
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 404) {
          setNotFound(true);
        } else {
          setError(error);
        }
      });
  }, [link]);

  if (notFound) {
    return (
      <NotFound
        title="That short link was not found."
        description="The short link you are trying to visit does not exist or has expired."
      />
    );
  }

  let title;
  let subtitle;
  let content;

  if (data !== null) {
    if (error) {
      title = "Something has gone wrong!";
      content = <Text mt={6}>Error: {error.message}. Please try again.</Text>;
    } else {
      subtitle = `Created ${new Date(data.createdAt).toLocaleDateString()}`;
      switch (data.type) {
        case "url":
          title = shortUrl(data.url);
          content = (
            <>
              <TimedRedirect href={data.url} />
            </>
          );
          break;
        case "paste":
          title = "Paste";
          content = (
            <>
              <LazyCodeHighlight language={data.language ?? null} code={data.code} id="paste-content" />
              <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link!)}?direct=1`} mt={10}>
                Download
              </Button>
            </>
          );
          break;
        case "upload": {
          title = data.filename;
          let size = `${data.size} bytes`;
          if (data.size > 1000000) {
            size = `${(data.size / 1000000).toFixed(1)} MB`;
          } else if (data.size > 1000) {
            size = `${(data.size / 1000).toFixed(1)} KB`;
          }

          content = (
            <>
              <Alert icon={<AlertOctagon size={32} />} color="red">
                Please note, files uploaded to VH7 are not checked for malware. Be cautious if downloading files from
                someone you do not know.
              </Alert>

              <Box style={{ overflowX: "auto" }}>
                <ul>
                  <li>
                    <b>SHA256 Hash:</b> <span id="upload-sha256">{data.hash}</span>
                  </li>
                  <li>
                    <b>File Size:</b> {size}
                  </li>
                </ul>
              </Box>

              <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link!)}?direct=1`}>
                Download {data.filename}
              </Button>
            </>
          );
          break;
        }
        case "event": {
          title = data.title;
          const startDate = DateTime.fromISO(data.startDate);
          const endDate = data.endDate !== null ? DateTime.fromISO(data.endDate) : null;
          subtitle = startDate.toLocaleString({ dateStyle: "long", timeStyle: data.allDay ? undefined : "short" });
          const lessThan24Hours = endDate === null || startDate.diff(endDate).hours < 24;
          if (endDate !== null && !(lessThan24Hours && data.allDay)) {
            subtitle += ` to ${endDate.toLocaleString({ dateStyle: lessThan24Hours ? undefined : "long", timeStyle: data.allDay ? undefined : "short" })}`;
          }
          content = (
            <Stack gap="xs">
              {data.location && (
                <Text>
                  <strong>Location:</strong> {data.location}
                </Text>
              )}
              {data.description && (
                <Text>
                  <strong>Description:</strong> {data.description}
                </Text>
              )}
              <Text c="dimmed">Created {new Date(data.createdAt).toLocaleDateString()}</Text>

              <Box>
                <Button
                  leftSection={<Calendar size={16} />}
                  component="a"
                  target="_blank"
                  href={googleCalendarUrl(data)}
                  me={12}
                >
                  Add to Google Calendar
                </Button>
                <Button
                  leftSection={<Calendar size={16} />}
                  component="a"
                  target="_blank"
                  href={outlookCalendarUrl(data)}
                  me={12}
                >
                  Add to Outlook
                </Button>
                <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link!)}?direct=1`} me={12}>
                  Add to iCloud & others (ICS)...
                </Button>
              </Box>
            </Stack>
          );
          break;
        }
      }
    }
  }

  return (
    <>
      <Header small />
      <Container my={20}>
        <Title order={2}>{title}</Title>
        {subtitle && <Text c="dimmed">{subtitle}</Text>}

        <Box my={16}>{content}</Box>
      </Container>
    </>
  );
}

export default View;
