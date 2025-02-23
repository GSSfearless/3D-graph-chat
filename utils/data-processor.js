import { extractKeywords, analyzeSentiment, extractRelations } from './nlp-utils';

export const processSearchResponse = (content) => {
  // 提取关键词和情感分析结果
  const keywords = extractKeywords(content);
  const sentiment = analyzeSentiment(content);
  const relations = extractRelations(content);

  // 返回处理后的数据
  return {
    keywords,
    sentiment,
    relations
  };
};

// 获取节点颜色
export const getNodeColor = (type) => {
  const colors = {
    entity: '#f87171',
    event: '#60a5fa',
    attribute: '#34d399',
    default: '#94a3b8'
  };
  
  return colors[type] || colors.default;
}; 