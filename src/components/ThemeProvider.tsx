// src/components/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import MetaTags from './MetaTags';

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MetaTags />
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
