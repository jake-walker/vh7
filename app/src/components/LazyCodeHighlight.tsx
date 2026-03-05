import { type CodeHighlightAdapter, createShikiAdapter } from "@mantine/code-highlight";
import { Flex, Loader, Tabs } from "@mantine/core";
import { lazy, Suspense, useEffect, useState } from "react";
import { AlignLeft, Code } from "react-feather";

const CodeHighlightAdapterProvider = lazy(() =>
  import("@mantine/code-highlight").then((module) => ({
    default: module.CodeHighlightAdapterProvider,
  })),
);

const CodeHighlight = lazy(() =>
  import("@mantine/code-highlight").then((module) => ({
    default: module.CodeHighlight,
  })),
);

const MarkdownPreview = lazy(() =>
  import("./previews/MarkdownPreview").then((module) => ({
    default: module.MarkdownPreview
  })),
);

interface LazyCodeHighlightProps {
  id: string;
  code: string;
  language: string | null;
}

const BigLoader = () => (
  <Flex justify="center" my="lg">
    <Loader size="md" />
  </Flex>
);

export function LazyCodeHighlight({ id, code, language }: LazyCodeHighlightProps) {
  const [shikiAdapter, setShikiAdapter] = useState<CodeHighlightAdapter | null>(null);

  useEffect(() => {
    setShikiAdapter(
      createShikiAdapter(async () => {
        const { createHighlighter } = await import("shiki");

        return createHighlighter({
          themes: [],
          langs: language != null ? [language] : [],
        });
      }),
    );
  }, [language]);

  if (!shikiAdapter) {
    return <BigLoader />;
  }

  if (language === "markdown") {
    return (
      <Suspense fallback={<BigLoader />}>
        <CodeHighlightAdapterProvider adapter={shikiAdapter}>
          <Tabs defaultValue="preview">
            <Tabs.List>
              <Tabs.Tab value="preview" leftSection={<AlignLeft size={16} />}>
                Preview
              </Tabs.Tab>
              <Tabs.Tab value="source" leftSection={<Code size={16} />}>
                Source
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="preview">
              <MarkdownPreview content={code} />
            </Tabs.Panel>

            <Tabs.Panel value="source">
              <CodeHighlight id={id} code={code} language={language ?? undefined} />
            </Tabs.Panel>
          </Tabs>
        </CodeHighlightAdapterProvider>
      </Suspense>
    );
  } else {
    return (
      <Suspense fallback={<BigLoader />}>
        <CodeHighlightAdapterProvider adapter={shikiAdapter}>
          <CodeHighlight id={id} code={code} language={language ?? undefined} />
        </CodeHighlightAdapterProvider>
      </Suspense>
    );
  }
}
