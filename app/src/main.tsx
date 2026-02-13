import { CodeHighlightAdapterProvider, createShikiAdapter } from "@mantine/code-highlight";
import { MantineProvider } from "@mantine/core";
import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import languages from "../../languages.json";
import App from "./App.tsx";
import { store } from "./store.ts";
import theme from "./theme.ts";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  integrations: [],
});

async function loadShiki() {
  const { createHighlighter } = await import("shiki/bundle/web");
  const shiki = await createHighlighter({
    langs: languages.map((l) => l.id),
    themes: [],
  });
  return shiki;
}

const shikiAdapter = createShikiAdapter(loadShiki);

createRoot(document.getElementById("root")!, {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <MantineProvider theme={theme}>
          <CodeHighlightAdapterProvider adapter={shikiAdapter}>
            <App />
          </CodeHighlightAdapterProvider>
        </MantineProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
