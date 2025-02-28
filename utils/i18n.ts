import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nodeDetails: {
        title: 'Node Details',
        relatedNodes: 'Related Nodes',
        properties: 'Properties',
        description: 'Description',
        noDescription: 'No description available.',
        close: 'Close',
        expand: 'Expand',
        collapse: 'Collapse',
      },
      chat: {
        title: 'AI Chat',
        minimize: 'Minimize',
        maximize: 'Maximize',
      },
    },
  },
  zh: {
    translation: {
      nodeDetails: {
        title: '节点详情',
        relatedNodes: '相关节点',
        properties: '属性',
        description: '描述',
        noDescription: '暂无描述',
        close: '关闭',
        expand: '展开',
        collapse: '收起',
      },
      chat: {
        title: 'AI 对话',
        minimize: '最小化',
        maximize: '最大化',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 