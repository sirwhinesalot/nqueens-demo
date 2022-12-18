import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import App from './app'
import './style.css'
import { invoke } from '@tauri-apps/api/tauri';

// prevent the default context menu from showing
window.addEventListener('contextmenu', event => event.preventDefault());

function Main() {
  const preferredColorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    invoke("show_window", {});
  }, []);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{colorScheme}} withGlobalStyles withNormalizeCSS>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main/>
  </React.StrictMode>,
)