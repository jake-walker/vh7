import { type CodeHighlightAdapter, createShikiAdapter } from "@mantine/code-highlight";
import { Flex, Loader } from "@mantine/core";
import { lazy, Suspense, useEffect, useState } from "react";

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

interface LazyCodeHighlightProps {
  id: string;
  code: string;
  language: string | null;
}

const BigLoader = () => (
  <Flex justify="center" my="lg">
    <Loader size="md" />
  </Flex>
)

export function LazyCodeHighlight({ id, code, language }: LazyCodeHighlightProps) {
  const [shikiAdapter, setShikiAdapter] = useState<CodeHighlightAdapter | null>(null);

  useEffect(() => {
    setShikiAdapter(createShikiAdapter(async () => {
      const { createHighlighter } = await import("shiki");

      return createHighlighter({
        themes: [],
        langs: language != null ? [language] : []
      })
    }));
  }, [language]);

  if (!shikiAdapter) {
    return <BigLoader />;
  }

  return (
    <Suspense fallback={<BigLoader />}>
      <CodeHighlightAdapterProvider adapter={shikiAdapter}>
        <CodeHighlight id={id} code={code} language={language ?? undefined} />
      </CodeHighlightAdapterProvider>
    </Suspense>
  );
}
