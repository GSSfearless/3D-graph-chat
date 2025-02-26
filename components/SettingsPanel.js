import React from 'react';
import { t } from '../utils/i18n';

const SettingsPanel = ({ settings, onSettingChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{t('settings.title')}</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t('settings.theme.label')}
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onSettingChange('theme', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="light">{t('settings.theme.light')}</option>
            <option value="dark">{t('settings.theme.dark')}</option>
            <option value="system">{t('settings.theme.system')}</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t('settings.animation.label')}
          </label>
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={settings.animations}
              onChange={(e) => onSettingChange('animations', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              {t('settings.animation.enable')}
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t('settings.performance.label')}
          </label>
          <select
            value={settings.performance}
            onChange={(e) => onSettingChange('performance', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="high">{t('settings.performance.high')}</option>
            <option value="balanced">{t('settings.performance.balanced')}</option>
            <option value="low">{t('settings.performance.low')}</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {t('settings.dataExport.label')}
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => onSettingChange('exportData', 'json')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('settings.dataExport.json')}
            </button>
            <button
              onClick={() => onSettingChange('exportData', 'csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('settings.dataExport.csv')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 