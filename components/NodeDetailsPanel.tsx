import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface NodeDetailsPanelProps {
  node: any; // 根据实际节点类型定义
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  onClose,
  className = '',
  style = {},
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!node) return null;

  return (
    <div 
      className={`bg-white dark:bg-gray-800 flex flex-col h-full ${className}`}
      style={style}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('nodeDetails.title')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {node.label}
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {node.description || t('nodeDetails.noDescription')}
            </p>
          </div>

          {/* 属性列表 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('nodeDetails.properties')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              {Object.entries(node.properties || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{key}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 相关节点 */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('nodeDetails.relatedNodes')}
            </h3>
            <div className="space-y-2">
              {(node.relatedNodes || []).map((relatedNode: any) => (
                <div
                  key={relatedNode.id}
                  className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {relatedNode.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPanel; 