import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faSliders, faTrash, faClock, faSearch } from '@fortawesome/free-solid-svg-icons';

const LeftPanel = ({
  searchHistory,
  onHistoryItemClick,
  onClearHistory,
  graphSettings,
  onSettingChange
}) => {
  const [activeTab, setActiveTab] = useState('history');

  const themes = [
    { id: 'default', name: '默认', colors: ['#1f77b4', '#ff7f0e'] },
    { id: 'dark', name: '暗色', colors: ['#2c3e50', '#34495e'] },
    { id: 'nature', name: '自然', colors: ['#27ae60', '#2ecc71'] },
    { id: 'warm', name: '暖色', colors: ['#e74c3c', '#c0392b'] }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 h-full p-4">
      {/* 标签切换 */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'history'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FontAwesomeIcon icon={faHistory} className="mr-2" />
          历史记录
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'settings'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FontAwesomeIcon icon={faSliders} className="mr-2" />
          图谱设置
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'history' ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">最近搜索</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                  清空
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-4xl text-gray-300 mb-2"
                />
                <p className="text-sm text-gray-400">暂无搜索记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onHistoryItemClick(item)}
                  >
                    <div className="text-sm text-gray-700 mb-1 line-clamp-2">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {item.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 节点大小 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                节点大小
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={graphSettings.nodeSize}
                onChange={(e) =>
                  onSettingChange('nodeSize', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 节点透明度 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                节点透明度
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={graphSettings.nodeOpacity * 100}
                onChange={(e) =>
                  onSettingChange('nodeOpacity', parseInt(e.target.value) / 100)
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 连线样式 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                连线样式
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSettingChange('lineStyle', 'straight')}
                  className={`py-2 px-3 text-sm rounded-lg ${
                    graphSettings.lineStyle === 'straight'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  直线
                </button>
                <button
                  onClick={() => onSettingChange('lineStyle', 'curve')}
                  className={`py-2 px-3 text-sm rounded-lg ${
                    graphSettings.lineStyle === 'curve'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  曲线
                </button>
              </div>
            </div>

            {/* 连线宽度 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                连线宽度
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={graphSettings.lineWidth}
                onChange={(e) =>
                  onSettingChange('lineWidth', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* 主题选择 */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                主题选择
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onSettingChange('theme', theme.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      graphSettings.theme === theme.id
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex space-x-2 mb-2">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeftPanel; 