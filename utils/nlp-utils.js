// 提取关键词
export const extractKeywords = (content) => {
  const lang = languageUtils.detectLanguage(content);
  const words = languageUtils.tokenize(content, lang);
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
      sentiment: analyzeSentimentForWord(text, lang)
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);

  return keywords;
};

// 情感分析
export const analyzeSentiment = (content) => {
  const lang = languageUtils.detectLanguage(content);
  let positiveCount = 0;
  let negativeCount = 0;

  const dictionary = sentimentDictionary[lang];
  const words = languageUtils.tokenize(content, lang);

  words.forEach(word => {
    word = word.toLowerCase();
    if (dictionary.positive.some(w => word.includes(w))) {
      positiveCount++;
    } else if (dictionary.negative.some(w => word.includes(w))) {
      negativeCount++;
    }
  });

  const total = positiveCount + negativeCount || 1;

  return {
    relevance: Math.random() * 0.3 + 0.7, // 模拟相关性分数
    importance: Math.random() * 0.3 + 0.7, // 模拟重要性分数
    novelty: Math.random() * 0.3 + 0.7, // 模拟新颖性分数
    credibility: Math.random() * 0.3 + 0.7, // 模拟可信度分数
    completeness: Math.random() * 0.3 + 0.7, // 模拟完整性分数
    sentiment: {
      positive: positiveCount / total,
      negative: negativeCount / total,
      score: (positiveCount - negativeCount) / total
    },
    timeline: generateSentimentTimeline(content)
  };
};

// 实体抽取函数
export const extractEntities = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    const lang = languageUtils.detectLanguage(text);
    const sentences = languageUtils.splitSentences(text, lang);
    const entities = new Map();

    const entityPattern = lang === 'zh' 
      ? /[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g
      : /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\b[A-Z]{2,}\b/g;

    sentences.forEach(sentence => {
      const matches = sentence.match(entityPattern) || [];
      
      matches.forEach(match => {
        const cleanMatch = match.replace(/[*]/g, '').trim();
        if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
          const nodeId = `node-${cleanMatch.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const entity = {
            id: nodeId,
            text: cleanMatch,
            label: cleanMatch,
            language: lang,
            isEvent: hasEventIndicators(cleanMatch, lang),
            isAttribute: hasAttributeIndicators(cleanMatch, lang),
            importance: calculateImportance(cleanMatch, text),
            properties: {}
          };

          console.log('创建实体:', {
            ID: nodeId,
            文本: cleanMatch,
            类型: entity.isEvent ? 'event' : (entity.isAttribute ? 'attribute' : 'entity')
          });

          entities.set(cleanMatch, entity);
          entities.set(nodeId, entity);
        }
      });
    });

    return Array.from(entities.values())
      .filter((entity, index, self) => 
        index === self.findIndex(e => e.id === entity.id)
      );
  } catch (error) {
    console.error('Error in extractEntities:', error);
    return [];
  }
};

// 关系抽取函数
export const extractRelations = async (text) => {
  try {
    const lang = languageUtils.detectLanguage(text);
    const relations = [];
    const sentences = languageUtils.splitSentences(text, lang);
    let relationId = 0;

    const patterns = relationPatterns[lang];
    let previousEntities = [];

    sentences.forEach(sentence => {
      const currentEntities = extractEntitiesFromSentence(sentence, lang);
      
      patterns.forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
              const sourceId = `node-${cleanSource.replace(/[^a-zA-Z0-9]/g, '_')}`;
              const targetId = `node-${cleanTarget.replace(/[^a-zA-Z0-9]/g, '_')}`;
              
              relations.push({
                id: `edge-${relationId++}`,
                source: { id: sourceId, text: cleanSource },
                target: { id: targetId, text: cleanTarget },
                type: pattern.type,
                label: pattern.label,
                language: lang,
                weight: calculateRelationWeight(cleanSource, cleanTarget, text),
                properties: {
                  sourceText: cleanSource,
                  targetText: cleanTarget,
                  context: sentence
                }
              });
            }
          }
        }
      });

      previousEntities = currentEntities;
    });

    return removeDuplicateRelations(relations);
  } catch (error) {
    console.error('Error in extractRelations:', error);
    return [];
  }
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

const analyzeSentimentForWord = (word, lang = 'zh') => {
  const dictionary = sentimentDictionary[lang];
  word = word.toLowerCase();
  
  if (dictionary.positive.some(w => word.includes(w))) {
    return 'positive';
  } else if (dictionary.negative.some(w => word.includes(w))) {
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
  return text.length >= 2 && !/^\d+$/.test(text);
};

const hasEventIndicators = (text, lang = 'zh') => {
  const patterns = {
    zh: [
      /[了过着]$/,
      /^(开始|结束|发生|完成|启动)/,
      /(并|或|而|但|然后)/
    ],
    en: [
      /ed$|ing$/,
      /^(start|end|occur|finish|begin)/i,
      /\b(and|or|but|then)\b/i
    ]
  };
  
  return patterns[lang].some(pattern => pattern.test(text));
};

const hasAttributeIndicators = (text, lang = 'zh') => {
  const patterns = {
    zh: [
      /^(大小|长度|宽度|高度|深度|重量|颜色|形状)/,
      /(性|度|率|量|值|数|比)$/,
      /^(可以|能够|应该|必须|不能|不可以)/
    ],
    en: [
      /^(size|length|width|height|depth|weight|color|shape)/i,
      /(ness|ity|tion|sion|ance|ence)$/,
      /^(can|could|should|must|cannot|may)/i
    ]
  };
  
  return patterns[lang].some(pattern => pattern.test(text));
};

const calculateImportance = (entity, fullText) => {
  try {
    const escapedEntity = entity.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedEntity, 'g');
    const frequency = (fullText.match(regex) || []).length;
    return Math.min(1, 0.3 + (frequency * 0.1));
  } catch (error) {
    console.error('计算重要性时出错:', error);
    return 0.3; // 返回默认重要性
  }
};

const extractEntitiesFromSentence = (sentence, lang) => {
  const entityPattern = lang === 'zh' 
    ? /[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g
    : /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|\b[A-Z]{2,}\b/g;

  const matches = sentence.match(entityPattern) || [];
  return matches
    .map(match => {
      const cleanMatch = match.replace(/[*]/g, '').trim();
      if (isValidEntity(cleanMatch)) {
        return {
          id: `node-${cleanMatch.replace(/[^a-zA-Z0-9]/g, '_')}`,
          text: cleanMatch,
          language: lang
        };
      }
      return null;
    })
    .filter(Boolean);
};

const calculateRelationWeight = (source, target, text) => {
  try {
    const sourceFreq = (text.match(new RegExp(source, 'g')) || []).length;
    const targetFreq = (text.match(new RegExp(target, 'g')) || []).length;
    const coOccurrence = sourceFreq + targetFreq;
    return Math.min(1, 0.3 + (coOccurrence * 0.1));
  } catch (error) {
    console.error('Error calculating relation weight:', error);
    return 0.3;
  }
};

const calculateSimilarity = (text1, text2) => {
  // 简单的字符重叠相似度计算
  const set1 = new Set(text1);
  const set2 = new Set(text2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

const removeDuplicateRelations = (relations) => {
  const seen = new Set();
  return relations.filter(relation => {
    const key = `${relation.source.id}-${relation.type}-${relation.target.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// 语言检测和处理工具
const languageUtils = {
  // 检测文本主要语言
  detectLanguage: (text) => {
    const zhPattern = /[\u4e00-\u9fa5]/g;
    const enPattern = /[a-zA-Z]/g;
    const zhCount = (text.match(zhPattern) || []).length;
    const enCount = (text.match(enPattern) || []).length;
    return zhCount > enCount ? 'zh' : 'en';
  },

  // 分句处理
  splitSentences: (text, lang) => {
    if (lang === 'zh') {
      return text.split(/[。！？]/);
    } else {
      return text.split(/[.!?]/);
    }
  },

  // 分词处理
  tokenize: (text, lang) => {
    if (lang === 'zh') {
      // 中文分词：按字符分割，保留完整词组
      return text.match(/[一-龥]+|[a-zA-Z]+|\d+/g) || [];
    } else {
      // 英文分词：按空格分割
      return text.split(/\s+/);
    }
  }
};

// 多语言情感词典
const sentimentDictionary = {
  zh: {
    positive: ['好', '优秀', '棒', '强', '高', '快', '优质', '出色', '完美', '精彩'],
    negative: ['差', '糟', '弱', '低', '慢', '坏', '劣质', '糟糕', '失败', '可怕'],
    neutral: ['一般', '普通', '正常', '标准', '中等']
  },
  en: {
    positive: ['good', 'great', 'excellent', 'strong', 'high', 'fast', 'perfect', 'amazing', 'wonderful', 'fantastic'],
    negative: ['bad', 'poor', 'weak', 'low', 'slow', 'terrible', 'awful', 'horrible', 'failed', 'worst'],
    neutral: ['normal', 'average', 'standard', 'medium', 'moderate']
  }
};

// 多语言关系模式
const relationPatterns = {
  zh: [
    { regex: /([^，。！？]+?)是([^，。！？]+)/g, type: 'is-a', label: '是' },
    { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
    { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
    { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
    { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
    { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供' }
  ],
  en: [
    { regex: /([^,.!?]+?)\s+is\s+([^,.!?]+)/g, type: 'is-a', label: 'is' },
    { regex: /([^,.!?]+?)\s+contains?\s+([^,.!?]+)/g, type: 'contains', label: 'contains' },
    { regex: /([^,.!?]+?)\s+belongs?\s+to\s+([^,.!?]+)/g, type: 'belongs-to', label: 'belongs to' },
    { regex: /([^,.!?]+?)\s+requires?\s+([^,.!?]+)/g, type: 'requires', label: 'requires' },
    { regex: /([^,.!?]+?)\s+uses?\s+([^,.!?]+)/g, type: 'uses', label: 'uses' },
    { regex: /([^,.!?]+?)\s+provides?\s+([^,.!?]+)/g, type: 'provides', label: 'provides' }
  ]
}; 