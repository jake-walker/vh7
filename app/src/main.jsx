import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import theme from './theme';
import store from './store';

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
      <Base />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
