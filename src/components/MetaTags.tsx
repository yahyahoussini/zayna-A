// src/components/MetaTags.tsx
import { Helmet } from 'react-helmet-async';
import { useTheme } from 'next-themes';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useEffect, useState } from 'react';

interface MetaTagsProps {
  color?: string;
}

const MetaTags = ({ color }: MetaTagsProps) => {
  const { theme } = useTheme();
  const themeColors = useThemeColors();
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  useEffect(() => {
    // The theme from next-themes can be "system", which we need to resolve.
    // We also handle the case where the theme is not yet determined.
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setEffectiveTheme(systemTheme);
    } else if (theme) {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const themeColor = color || (effectiveTheme === 'dark' ? themeColors.dark : themeColors.light);
  const statusBarContent = effectiveTheme === 'dark' ? 'black-translucent' : 'default';

  return (
    <Helmet>
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-status-bar-style" content={statusBarContent} />
    </Helmet>
  );
};

export default MetaTags;
