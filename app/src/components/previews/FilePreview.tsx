import { Alert, Box, Code, Flex, Image, Loader, ScrollArea, useComputedColorScheme } from "@mantine/core";
import { lazy, Suspense, useEffect, useState } from "react";
import { AlertCircle, Info } from "react-feather";
import { formatBytes, getPreviewType } from "../../util";

const PREVIEW_HEIGHT = "600px";

const MarkdownContentPreview = lazy(() =>
  import("./MarkdownPreview").then((module) => ({
    default: module.MarkdownPreview,
  })),
);

// MARK: Helpers

function TruncationMessage({ maxSize, truncated }: { maxSize: number; truncated: boolean }) {
  if (!truncated) return null;

  return (
    <Alert variant="light" color="blue" icon={<Info />} mb="md">
      Only the first {formatBytes(maxSize)} of the file are shown in this preview.
    </Alert>
  );
}

function PreviewSkeleton() {
  return (
    <Flex justify="center" align="center" direction="column" my="lg" h={PREVIEW_HEIGHT}>
      <Loader size="md" />
      <p>Loading preview...</p>
    </Flex>
  );
}

function PreviewError({ message }: { message?: string }) {
  return (
    <Alert variant="light" color="orange" icon={<AlertCircle />} mb="md">
      {message ?? "Failed to load file preview."}
    </Alert>
  );
}

// MARK: Sub-components

function ImagePreview({ url, filename }: { url: string; filename?: string }) {
  return (
    <Image
      src={url}
      alt={filename ?? "Uploaded image"}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      radius="md"
      style={{ maxHeight: PREVIEW_HEIGHT }}
      w="auto"
      fit="contain"
      mx="auto"
    />
  );
}

function VideoPreview({ url }: { url: string }) {
  return (
    // biome-ignore lint/a11y/useMediaCaption: no captions for user uploaded content
    <video
      controls
      style={{
        maxHeight: PREVIEW_HEIGHT,
        width: "100%",
        borderRadius: "var(--mantine-radius-md, 0)",
      }}
    >
      <source src={url} />
      Your browser doesn't support video playback.
    </video>
  );
}

function AudioPreview({ url }: { url: string }) {
  return (
    // biome-ignore lint/a11y/useMediaCaption: no captions for user uploaded content
    <audio controls style={{ width: "100%" }}>
      <source src={url} />
      Your browser doesn't support audio playback.
    </audio>
  );
}

function PdfPreview({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      style={{ height: PREVIEW_HEIGHT, width: "100%" }}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      title="PDF preview"
    />
  );
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const MAX_BYTES = 200_000;

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { headers: { Range: `bytes=0-${MAX_BYTES}` }, signal: controller.signal })
      .then((res) => {
        setTruncated(res.status === 206);
        return res.text();
      })
      .then(setText)
      .catch((err) => {
        if (err.name === "AbortError" || err.name === "CancelError") return;
        setError(true);
      });

    return () => controller.abort();
  }, [url]);

  if (error) return <PreviewError />;
  if (text === null) return <PreviewSkeleton />;

  return (
    <>
      <TruncationMessage maxSize={MAX_BYTES} truncated={truncated} />
      <ScrollArea h={PREVIEW_HEIGHT} type="auto">
        <Code block h="100%">
          {text}
        </Code>
      </ScrollArea>
    </>
  );
}

function MarkdownPreview({ url }: { url: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const colorScheme = useComputedColorScheme();

  const MAX_BYTES = 500_000;

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { headers: { Range: `bytes=0-${MAX_BYTES}` }, signal: controller.signal })
      .then((res) => {
        setTruncated(res.status === 206);
        return res.text();
      })
      .then((raw) => {
        if (!controller.signal.aborted) setContent(raw);
      })
      .catch((err) => {
        if (err.name === "AbortError" || err.name === "CancelError") return;
        if (!controller.signal.aborted) setError(true);
      });

    return () => controller.abort();
  }, [url]);

  if (error) return <PreviewError />;
  if (content === null) return <PreviewSkeleton />;

  return (
    <>
      <TruncationMessage maxSize={MAX_BYTES} truncated={truncated} />
      <ScrollArea
        style={(theme) => ({
          backgroundColor: colorScheme === "dark" ? theme.colors.gray[9] : theme.colors.gray[0],
          borderRadius: "var(--mantine-radius-md, 0)",
        })}
        type="auto"
        h={PREVIEW_HEIGHT}
      >
        <Box p="lg">
          <MarkdownContentPreview content={content} />
        </Box>
      </ScrollArea>
    </>
  );
}

// MARK: Public API

interface FilePreviewProps {
  url: string;
  mimeType: string;
  filename?: string;
}

export function FilePreview({ url, mimeType, filename }: FilePreviewProps) {
  const type = getPreviewType(mimeType, filename);

  if (type === "unsupported") return null;

  return (
    <>
      {type === "image" && <ImagePreview url={url} filename={filename} />}
      {type === "video" && <VideoPreview url={url} />}
      {type === "audio" && <AudioPreview url={url} />}
      {type === "pdf" && <PdfPreview url={url} />}
      {type === "text" && <TextPreview url={url} />}
      {type === "markdown" && (
        <Suspense fallback={<PreviewSkeleton />}>
          <MarkdownPreview url={url} />
        </Suspense>
      )}
    </>
  );
}
