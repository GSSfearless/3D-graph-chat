import React from 'react';
import { t } from '../utils/i18n';

const chartTypes = [
  {
    id: 'tagSphere',
    icon: '🌐',
    animationClass: 'preview-tag-sphere'
  },
  {
    id: 'fluid',
    icon: '💫',
    animationClass: 'preview-fluid'
  },
  {
    id: 'radar',
    icon: '📊',
    animationClass: 'preview-radar'
  },
  {
    id: 'geoBubble',
    icon: '🌍',
    animationClass: 'preview-geo'
  },
  {
    id: 'network',
    icon: '🕸️',
    animationClass: 'preview-network'
  },
  {
    id: 'waveform',
    icon: '〰️',
    animationClass: 'preview-wave'
  }
];

const ChartSelector = ({ onSelect, selectedType }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {chartTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`p-4 rounded-lg transition-all duration-300 ${
            selectedType === type.id
              ? 'bg-blue-100 border-2 border-blue-500'
              : 'bg-white border border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-2xl">{type.icon}</span>
            <h3 className="font-medium text-sm text-center">
              {t(`chart.types.${type.id}.name`)}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {t(`chart.types.${type.id}.description`)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChartSelector; 