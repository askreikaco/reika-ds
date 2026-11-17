import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@carbon/styles/css/styles.css';
import { Button, Theme, Tile } from '@carbon/react';

function App() {
  return (
    <Theme theme="g10">
      <main style={{ padding: '2rem' }}>
        <Tile>
          <p>REIKA DS catalog: coming soon</p>
          <Button kind="primary">Notify me</Button>
        </Tile>
      </main>
    </Theme>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
