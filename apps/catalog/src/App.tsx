import { useEffect, useState } from 'react';
import { ContentSwitcher, Switch, Theme } from '@carbon/react';
import { routeFor, routes } from './routes';

// g10 = light, g100 = dark. The initial theme can come from ?theme=g100 (used for screenshots).
type CatalogTheme = 'g10' | 'g100';
const THEMES: CatalogTheme[] = ['g10', 'g100'];

function initialTheme(): CatalogTheme {
  return new URLSearchParams(window.location.search).get('theme') === 'g100' ? 'g100' : 'g10';
}

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export function App() {
  const [theme, setTheme] = useState<CatalogTheme>(initialTheme);
  const current = routeFor(useHash());
  const { Page } = current;

  return (
    <Theme theme={theme}>
      <div className="catalog">
        <header className="catalog__header">
          <p className="catalog__title">REIKA DS catalog</p>
          <ContentSwitcher
            size="sm"
            selectedIndex={THEMES.indexOf(theme)}
            onChange={({ index }) => setTheme(THEMES[index ?? 0])}
            aria-label="Theme"
          >
            <Switch name="g10" text="Light (g10)" />
            <Switch name="g100" text="Dark (g100)" />
          </ContentSwitcher>
        </header>
        <nav className="catalog__nav" aria-label="Components">
          {routes.map((route) => (
            <a
              key={route.slug}
              href={`#/${route.slug}`}
              className="catalog__link"
              aria-current={route.slug === current.slug ? 'page' : undefined}
            >
              {route.title}
            </a>
          ))}
        </nav>
        <main className="catalog__main">
          <Page />
        </main>
      </div>
    </Theme>
  );
}
