import { Alert, Badge, Box, Button, Container, Stack, Text, Title } from "@mantine/core";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { AlertOctagon, AlignLeft, Calendar, Download, MapPin } from "react-feather";
import { useParams } from "react-router";
import { googleCalendarUrl, outlookCalendarUrl } from "../calendarLinks";
import Header from "../components/Header";
import { LazyCodeHighlight } from "../components/LazyCodeHighlight";
import { FilePreview } from "../components/previews/FilePreview";
import TimedRedirect from "../components/TimedRedirect";
import { info as getInfo, idToUrl, shortUrl } from "../controller";
import { formatBytes, getPreviewType } from "../util";
import NotFound from "./NotFound";

function View() {
  const { link } = useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getInfo>> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (link === undefined) return;

    const controller = new AbortController();

    getInfo(link, controller.signal)
      .then((data) => {
        if (data === null) {
          setNotFound(true);
        } else {
          setData(data);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.name === "CancelError") return;
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError(err);
        }
      });

    return () => controller.abort();
  }, [link]);

  if (notFound) {
    return (
      <NotFound
        title="That short link was not found."
        description="The short link you are trying to visit does not exist or has expired."
      />
    );
  }

  let title: string = "";
  let subtitle: string = "";
  let content: React.ReactElement = <></>;

  if (data !== null) {
    if (error) {
      title = "Something has gone wrong!";
      content = <Text mt={6}>Error: {error.message}. Please try again.</Text>;
    } else {
      subtitle = `Created ${new Date(data.createdAt).toLocaleDateString()}`;
      switch (data.type) {
        case "url":
          title = shortUrl(data.url);
          content = <TimedRedirect href={data.url} />;
          break;
        case "paste":
          title = "Paste";
          content = (
            <>
              {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
              <LazyCodeHighlight language={data.language ?? null} code={data.code} id="paste-content" />
              {link !== undefined && (
                <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link)}?direct=1`} mt={10}>
                  Download
                </Button>
              )}
            </>
          );
          break;
        case "upload": {
          title = data.filename;
          const previewType = getPreviewType(data.mimeType ?? "", data.filename);

          content = (
            <>
              <Alert icon={<AlertOctagon size={32} />} color="red">
                Please note, files uploaded to VH7 are not checked for malware. Be cautious if downloading files from
                someone you do not know.
                {previewType !== "unsupported" &&
                  <span>{" "}<b>This file is shown below as a preview</b> - it may display content (like links or forms) that appear to be part of this website but are not.</span>}
              </Alert>

              {link !== undefined && (
                <Box my="md">
                  <FilePreview
                    url={`${idToUrl(link)}?serve=1`}
                    filename={data.filename}
                    mimeType={data.mimeType ?? ""}
                  />
                </Box>
              )}

              <Box style={{ overflowX: "auto" }}>
                <ul>
                  <li>
                    {/** biome-ignore lint/correctness/useUniqueElementIds: currently used for testing */}
                    <b>SHA256 Hash:</b> <span id="upload-sha256">{data.hash}</span>
                  </li>
                  <li>
                    <b>File Size:</b> {formatBytes(data.size)}
                  </li>
                  {data.mimeType && (
                    <li>
                      <b>Mime Type:</b> {data.mimeType}
                      {previewType !== "unsupported" && <Badge variant="light" ms="xs">{previewType}</Badge>}
                    </li>
                  )}
                </ul>
              </Box>

              {link !== undefined && (
                <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link)}?direct=1`}>
                  Download {data.filename}
                </Button>
              )}
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
                  <strong><MapPin size={14} /> Location:</strong> {data.location}
                </Text>
              )}
              {data.description && (
                <Text>
                  <strong><AlignLeft size={14} /> Description:</strong> {data.description}
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
                {link !== undefined && (
                  <Button leftSection={<Download size={16} />} component="a" href={`${idToUrl(link)}?direct=1`} me={12}>
                    Add to iCloud & others (ICS)...
                  </Button>
                )}
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
