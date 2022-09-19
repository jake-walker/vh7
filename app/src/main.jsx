import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { init as initSentry } from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from './App';
import theme from './theme';
import store from './store';

initSentry({
  dsn: "https://8312fbcf256d4384b11dc1c8f6f569df@o170830.ingest.sentry.io/6724288",
  integrations: [new BrowserTracing()],
  tracesSampleRate: 0.1,
});

function Base() {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const toggleColorScheme = (value) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Base />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
