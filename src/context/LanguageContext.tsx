import { createContext, useContext, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  supportedLanguages: Language[];
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { lang: langFromUrl } = useParams();
  const [lang, setLanguageState] = useState(langFromUrl || 'en');

  const setLang = (newLang: string) => {
    setLanguageState(newLang);
    const pathParts = window.location.pathname.split('/').filter(p => p);

    if (supportedLanguages.some(l => l.code === pathParts[0])) {
      pathParts[0] = newLang;
    } else {
      pathParts.unshift(newLang);
    }

    const newPath = `/${pathParts.join('/')}`;
    navigate(newPath);
  };

  const value = { lang, setLang, supportedLanguages };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
