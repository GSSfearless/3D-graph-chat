import React, { useEffect, useState } from 'react';
import { i18n, t } from '../utils/i18n';

const LanguageSelector = () => {
  const [currentLocale, setCurrentLocale] = useState(i18n.getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (event) => {
      setCurrentLocale(event.detail.locale);
    };

    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, []);

  const handleLanguageChange = (locale) => {
    i18n.setLocale(locale);
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {i18n.getSupportedLocales().map((locale) => (
          <option key={locale} value={locale}>
            {i18n.getLocaleName(locale)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector; 