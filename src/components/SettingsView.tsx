import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';

export function SettingsView() {
  const { t, language, setLanguage } = useI18n();

  const languages: { value: Language; label: string }[] = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ];

  return (
    <div className="settings-view">
      <h1 className="settings-title">{t('settings.title')}</h1>

      <div className="settings-section">
        <div className="settings-section-label">{t('settings.language')}</div>
        <div className="settings-options">
          {languages.map(l => (
            <button
              key={l.value}
              className={`settings-option${language === l.value ? ' active' : ''}`}
              onClick={() => setLanguage(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
