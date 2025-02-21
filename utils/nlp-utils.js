// 提取关键词
export const extractKeywords = (content) => {
  // 简单的分词和权重计算
  const words = content.split(/\s+/);
  const wordFreq = {};
  
  // 计算词频
  words.forEach(word => {
    word = word.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '');
    if (word && word.length > 1) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // 转换为关键词数组
  const keywords = Object.entries(wordFreq)
    .map(([text, freq]) => ({
      text,
      weight: freq / words.length,
      sentiment: analyzeSentimentForWord(text)
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);

  return keywords;
};

// 情感分析
export const analyzeSentiment = (content) => {
  // 简单的情感分析
  const positiveWords = ['好', '优秀', '棒', '强', '高', '快'];
  const negativeWords = ['差', '糟', '弱', '低', '慢', '坏'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    positiveCount += (content.match(new RegExp(word, 'g')) || []).length;
  });

  negativeWords.forEach(word => {
    negativeCount += (content.match(new RegExp(word, 'g')) || []).length;
  });

  const total = positiveCount + negativeCount || 1;

  return {
    relevance: Math.random() * 0.3 + 0.7, // 模拟相关性分数
    importance: Math.random() * 0.3 + 0.7, // 模拟重要性分数
    novelty: Math.random() * 0.3 + 0.7, // 模拟新颖性分数
    credibility: Math.random() * 0.3 + 0.7, // 模拟可信度分数
    completeness: Math.random() * 0.3 + 0.7, // 模拟完整性分数
    timeline: generateSentimentTimeline(content)
  };
};

// 实体抽取函数
export const extractEntities = async (text) => {
  // 简单的实体抽取实现
  const sentences = text.split(/[。！？.!?]/);
  const entities = [];
  let entityId = 0;

  sentences.forEach(sentence => {
    // 提取可能的实体（2个或更多连续的非标点字符）
    const matches = sentence.match(/[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g) || [];
    
    matches.forEach(match => {
      const cleanMatch = match.replace(/[*]/g, '').trim(); // 清理特殊字符
      if (isValidEntity(cleanMatch)) {
        entities.push({
          id: `node-${entityId++}`,
          text: cleanMatch,
          label: cleanMatch, // 确保每个实体都有label属性
          isEvent: hasEventIndicators(cleanMatch),
          isAttribute: hasAttributeIndicators(cleanMatch),
          isConcept: hasConceptIndicators(cleanMatch),
          importance: calculateImportance(cleanMatch, text),
          properties: {}
        });
      }
    });
  });

  return entities;
};

// 关系抽取函数
export const extractRelations = async (text) => {
  const relations = [];
  const sentences = text.split(/[。！？.!?]/);
  let relationId = 0;

  const patterns = [
    { regex: /([^，。！？]+)是([^，。！？]+)/, type: 'is-a', label: '是' },
    { regex: /([^，。！？]+)包含([^，。！？]+)/, type: 'contains', label: '包含' },
    { regex: /([^，。！？]+)属于([^，。！？]+)/, type: 'belongs-to', label: '属于' },
    { regex: /([^，。！？]+)导致([^，。！？]+)/, type: 'causes', label: '导致' },
    { regex: /([^，。！？]+)使用([^，。！？]+)/, type: 'uses', label: '使用' },
    { regex: /([^，。！？]+)产生([^，。！？]+)/, type: 'produces', label: '产生' }
  ];

  sentences.forEach(sentence => {
    patterns.forEach(pattern => {
      const matches = sentence.match(pattern.regex);
      if (matches && matches.length >= 3) {
        const [, source, target] = matches;
        const cleanSource = source.replace(/[*]/g, '').trim();
        const cleanTarget = target.replace(/[*]/g, '').trim();
        
        if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
          relations.push({
            id: `edge-${relationId++}`,
            source: cleanSource,
            target: cleanTarget,
            type: pattern.type,
            label: pattern.label,
            weight: 1
          });
        }
      }
    });
  });

  return relations;
};

// 计算向量嵌入
export const computeEmbeddings = async (entities) => {
  // 简单的向量嵌入实现
  return entities.map(entity => {
    // 生成一个简单的 5 维向量作为嵌入
    return Array.from({ length: 5 }, () => Math.random());
  });
};

// 辅助函数

const analyzeSentimentForWord = (word) => {
  const positiveWords = ['好', '优秀', '棒', '强', '高', '快'];
  const negativeWords = ['差', '糟', '弱', '低', '慢', '坏'];

  if (positiveWords.some(w => word.includes(w))) {
    return 'positive';
  } else if (negativeWords.some(w => word.includes(w))) {
    return 'negative';
  }
  return 'neutral';
};

const generateSentimentTimeline = (content) => {
  const length = 100;
  return Array.from({ length }, (_, i) => ({
    time: i,
    value: Math.sin(i * 0.1) * 0.5 + 0.5 + Math.random() * 0.1
  }));
};

const isValidEntity = (text) => {
  const invalidPatterns = [
    /^[的地得]/, // 不以助词开头
    /^[和与或而且但是然后因此所以]/, // 不以连接词开头
    /^\d+$/, // 不是纯数字
    /^[,.，。、；：！？]/, // 不是标点符号
    /[，。、；：！？]+/ // 不包含标点符号
  ];

  return text.length >= 2 && 
         text.length <= 20 && 
         !invalidPatterns.some(pattern => pattern.test(text));
};

const hasEventIndicators = (text) => {
  const eventPatterns = [
    /[了过着]$/,
    /^(发生|开始|结束|完成)/,
    /(举[办行]|开展|进行)/
  ];
  return eventPatterns.some(pattern => pattern.test(text));
};

const hasAttributeIndicators = (text) => {
  const attributePatterns = [
    /^(大小|长度|宽度|高度|重量|颜色|性质|特征)/,
    /(程度|等级|级别|品质)$/
  ];
  return attributePatterns.some(pattern => pattern.test(text));
};

const hasConceptIndicators = (text) => {
  const conceptPatterns = [
    /^(概念|理论|方法|系统|原理)/,
    /(思想|观点|主义)$/
  ];
  return conceptPatterns.some(pattern => pattern.test(text));
};

const calculateImportance = (entity, fullText) => {
  try {
    // 安全地创建正则表达式
    const escapedEntity = entity.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedEntity, 'g');
    const frequency = (fullText.match(regex) || []).length;
    return Math.min(1, 0.3 + (frequency * 0.1));
  } catch (error) {
    console.error('计算重要性时出错:', error);
    return 0.3; // 返回默认重要性
  }
}; 