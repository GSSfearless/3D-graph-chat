// Language detection and constants
const SUPPORTED_LANGUAGES = {
  EN: 'en',
  ZH: 'zh'
};

const detectLanguage = (text) => {
  // Simple language detection based on character set
  const zhCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enCount = (text.match(/[a-zA-Z]/g) || []).length;
  return zhCount > enCount ? SUPPORTED_LANGUAGES.ZH : SUPPORTED_LANGUAGES.EN;
};

// Multilingual dictionaries
const SENTIMENT_DICTIONARY = {
  [SUPPORTED_LANGUAGES.EN]: {
    positive: ['good', 'excellent', 'great', 'strong', 'high', 'fast', 'better', 'best', 'superior', 'amazing'],
    negative: ['bad', 'poor', 'weak', 'low', 'slow', 'worse', 'worst', 'inferior', 'terrible', 'awful']
  },
  [SUPPORTED_LANGUAGES.ZH]: {
    positive: ['好', '优秀', '棒', '强', '高', '快', '优质', '卓越', '出色', '完美'],
    negative: ['差', '糟', '弱', '低', '慢', '坏', '劣质', '糟糕', '失败', '不佳']
  }
};

const EVENT_PATTERNS = {
  [SUPPORTED_LANGUAGES.EN]: [
    /ed$/, // past tense
    /ing$/, // continuous tense
    /^(start|end|begin|finish|complete|launch)/,
    /(and|or|but|then|while)/
  ],
  [SUPPORTED_LANGUAGES.ZH]: [
    /[了过着]$/,
    /^(开始|结束|发生|完成|启动)/,
    /(并|或|而|但|然后)/
  ]
};

const ATTRIBUTE_PATTERNS = {
  [SUPPORTED_LANGUAGES.EN]: [
    /^(size|length|width|height|depth|weight|color|shape)/,
    /(ness|ity|tion|sion|ance|ence)$/,
    /^(can|could|should|must|may|might)/
  ],
  [SUPPORTED_LANGUAGES.ZH]: [
    /^(大小|长度|宽度|高度|深度|重量|颜色|形状)/,
    /(性|度|率|量|值|数|比)$/,
    /^(可以|能够|应该|必须|不能|不可以)/
  ]
};

// 提取关键词
export const extractKeywords = (content) => {
  const lang = detectLanguage(content);
  const words = content.split(/\s+/);
  const wordFreq = {};
  
  // Calculate word frequency
  words.forEach(word => {
    word = word.toLowerCase().replace(
      lang === SUPPORTED_LANGUAGES.EN ? /[^\w\s]/ : /[^\w\u4e00-\u9fa5]/g, 
      ''
    );
    if (word && word.length > 1) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Convert to keywords array
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
  const lang = detectLanguage(content);
  const { positive: positiveWords, negative: negativeWords } = SENTIMENT_DICTIONARY[lang];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    positiveCount += (content.toLowerCase().match(new RegExp(word.toLowerCase(), 'g')) || []).length;
  });

  negativeWords.forEach(word => {
    negativeCount += (content.toLowerCase().match(new RegExp(word.toLowerCase(), 'g')) || []).length;
  });

  const total = positiveCount + negativeCount || 1;

  return {
    relevance: Math.random() * 0.3 + 0.7,
    importance: Math.random() * 0.3 + 0.7,
    novelty: Math.random() * 0.3 + 0.7,
    credibility: Math.random() * 0.3 + 0.7,
    completeness: Math.random() * 0.3 + 0.7,
    timeline: generateSentimentTimeline(content)
  };
};

// 实体抽取函数
export const extractEntities = async (text) => {
  try {
    const lang = detectLanguage(text);
    
    // Language-specific entity patterns
    const entityPatterns = {
      [SUPPORTED_LANGUAGES.EN]: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b|\b[A-Z]+\b/g,
      [SUPPORTED_LANGUAGES.ZH]: /[一-龥][一-龥\d]*[一-龥]+/g
    };

    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    const normalizeId = (text) => {
      if (!text) return '';
      const cleanText = text.replace(/[*]/g, '').trim();
      const baseId = cleanText.startsWith('node-') ? cleanText.slice(5) : cleanText;
      return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    };

    const sentences = lang === SUPPORTED_LANGUAGES.EN ? 
      text.split(/[.!?]+/) :
      text.split(/[。！？.!?]/);

    const entities = new Map();
    
    sentences.forEach(sentence => {
      const matches = sentence.match(entityPatterns[lang]) || [];
      
      matches.forEach(match => {
        const cleanMatch = match.replace(/[*]/g, '').trim();
        if (isValidEntity(cleanMatch, lang)) {
          const nodeId = normalizeId(cleanMatch);
          const entity = {
            id: nodeId,
            text: cleanMatch,
            label: cleanMatch,
            isEvent: hasEventIndicators(cleanMatch, lang),
            isAttribute: hasAttributeIndicators(cleanMatch, lang),
            importance: calculateImportance(cleanMatch, text),
            properties: {}
          };

          console.log('Creating entity:', {
            ID: nodeId,
            Text: cleanMatch,
            Type: entity.isEvent ? 'event' : (entity.isAttribute ? 'attribute' : 'entity')
          });

          entities.set(cleanMatch, entity);
          entities.set(nodeId, entity);
        }
      });
    });

    const result = Array.from(entities.values());
    const seen = new Set();
    const uniqueResult = result.filter(entity => {
      if (seen.has(entity.id)) return false;
      seen.add(entity.id);
      return true;
    });

    return uniqueResult;
  } catch (error) {
    console.error('Error in extractEntities:', error);
    return [];
  }
};

// Relation patterns for different languages
const RELATION_PATTERNS = {
  [SUPPORTED_LANGUAGES.EN]: [
    { regex: /([^,.!?]+?)\s+is\s+([^,.!?]+)/g, type: 'is-a', label: 'is' },
    { regex: /([^,.!?]+?)\s+contains\s+([^,.!?]+)/g, type: 'contains', label: 'contains' },
    { regex: /([^,.!?]+?)\s+belongs\s+to\s+([^,.!?]+)/g, type: 'belongs-to', label: 'belongs to' },
    { regex: /([^,.!?]+?)\s+requires\s+([^,.!?]+)/g, type: 'requires', label: 'requires' },
    { regex: /([^,.!?]+?)\s+performs\s+([^,.!?]+)/g, type: 'performs', label: 'performs' },
    { regex: /([^,.!?]+?)\s+uses\s+([^,.!?]+)/g, type: 'uses', label: 'uses' },
    { regex: /([^,.!?]+?)\s+provides\s+([^,.!?]+)/g, type: 'provides', label: 'provides' },
    { regex: /([^,.!?]+?)\s+obtains\s+([^,.!?]+)/g, type: 'obtains', label: 'obtains' }
  ],
  [SUPPORTED_LANGUAGES.ZH]: [
    { regex: /([^，。！？]+?)是([^，。！？]+)/g, type: 'is-a', label: '是' },
    { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
    { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
    { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
    { regex: /([^，。！？]+?)进行([^，。！？]+)/g, type: 'performs', label: '进行' },
    { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
    { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供' },
    { regex: /([^，。！？]+?)获得([^，。！？]+)/g, type: 'obtains', label: '获得' }
  ]
};

// Extract relations function
export const extractRelations = async (text) => {
  try {
    const lang = detectLanguage(text);
    const relations = [];
    const sentences = lang === SUPPORTED_LANGUAGES.EN ? 
      text.split(/[.!?]+/) : 
      text.split(/[，。！？.!?;；]/);
    let relationId = 0;

    const normalizeId = (text) => {
      if (!text) return '';
      const cleanText = text.replace(/[*]/g, '').trim();
      const baseId = cleanText.startsWith('node-') ? cleanText.slice(5) : cleanText;
      return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    };

    // Process each sentence
    let previousEntities = [];
    sentences.forEach(sentence => {
      const currentEntities = extractEntitiesFromSentence(sentence, lang);
      
      // Process pattern matching relations
      RELATION_PATTERNS[lang].forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource, lang) && isValidEntity(cleanTarget, lang)) {
              const sourceId = normalizeId(cleanSource);
              const targetId = normalizeId(cleanTarget);
              
              const weight = calculateRelationWeight(cleanSource, cleanTarget, text);
              
              relations.push({
                id: `edge-${relationId++}`,
                source: {
                  id: sourceId,
                  text: cleanSource
                },
                target: {
                  id: targetId,
                  text: cleanTarget
                },
                type: pattern.type,
                label: pattern.label,
                weight: weight,
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

      // Add contextual relations
      if (previousEntities.length > 0 && currentEntities.length > 0) {
        previousEntities.forEach(prev => {
          currentEntities.forEach(curr => {
            if (prev.id !== curr.id) {
              relations.push({
                id: `edge-${relationId++}`,
                source: {
                  id: prev.id,
                  text: prev.text
                },
                target: {
                  id: curr.id,
                  text: curr.text
                },
                type: 'context',
                label: lang === SUPPORTED_LANGUAGES.EN ? 'contextual relation' : '上下文关联',
                weight: 0.3,
                properties: {
                  sourceText: prev.text,
                  targetText: curr.text
                }
              });
            }
          });
        });
      }

      previousEntities = currentEntities;
    });

    // Add semantic similarity relations
    const keywords = extractKeywords(text);
    for (let i = 0; i < keywords.length - 1; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const similarity = calculateSimilarity(keywords[i].text, keywords[j].text);
        if (similarity > 0.5) {
          const sourceId = normalizeId(keywords[i].text);
          const targetId = normalizeId(keywords[j].text);
          relations.push({
            id: `edge-${relationId++}`,
            source: {
              id: sourceId,
              text: keywords[i].text
            },
            target: {
              id: targetId,
              text: keywords[j].text
            },
            type: 'similar',
            label: lang === SUPPORTED_LANGUAGES.EN ? 'similar' : '相似',
            weight: similarity
          });
        }
      }
    }

    return removeDuplicateRelations(relations);
  } catch (error) {
    console.error('Error in extractRelations:', error);
    return [];
  }
};

// Compute embeddings
export const computeEmbeddings = async (entities) => {
  // Simple vector embedding implementation
  return entities.map(entity => {
    // Generate a simple 5-dimensional vector as embedding
    return Array.from({ length: 5 }, () => Math.random());
  });
};

// Helper functions with language support
const isValidEntity = (text, lang) => {
  if (lang === SUPPORTED_LANGUAGES.EN) {
    return text.length >= 2 && !/^\d+$/.test(text);
  }
  return text.length >= 2 && !/^\d+$/.test(text);
};

const hasEventIndicators = (text, lang) => {
  const patterns = EVENT_PATTERNS[lang];
  return patterns.some(pattern => pattern.test(text));
};

const hasAttributeIndicators = (text, lang) => {
  const patterns = ATTRIBUTE_PATTERNS[lang];
  return patterns.some(pattern => pattern.test(text));
};

const analyzeSentimentForWord = (word, lang) => {
  const { positive, negative } = SENTIMENT_DICTIONARY[lang];
  
  if (positive.some(w => word.toLowerCase().includes(w.toLowerCase()))) {
    return 'positive';
  } else if (negative.some(w => word.toLowerCase().includes(w.toLowerCase()))) {
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
  const entityPatterns = {
    [SUPPORTED_LANGUAGES.EN]: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b|\b[A-Z]+\b/g,
    [SUPPORTED_LANGUAGES.ZH]: /[一-龥][一-龥\d]*[一-龥]+/g
  };

  const matches = sentence.match(entityPatterns[lang]) || [];
  return matches
    .map(match => {
      const cleanMatch = match.replace(/[*]/g, '').trim();
      if (isValidEntity(cleanMatch, lang)) {
        return {
          id: `node-${cleanMatch.replace(/[^a-zA-Z0-9]/g, '_')}`,
          text: cleanMatch
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