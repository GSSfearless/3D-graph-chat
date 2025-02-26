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
  // 双语情感词典
  const sentimentDictionaries = {
    zh: {
      positive: ['好', '优秀', '棒', '强', '高', '快'],
      negative: ['差', '糟', '弱', '低', '慢', '坏']
    },
    en: {
      positive: ['good', 'great', 'excellent', 'strong', 'high', 'fast'],
      negative: ['bad', 'poor', 'weak', 'low', 'slow', 'terrible']
    }
  };

  let positiveCount = 0;
  let negativeCount = 0;

  // 检测语言
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(content);
  const dict = hasChineseChars ? sentimentDictionaries.zh : sentimentDictionaries.en;

  dict.positive.forEach(word => {
    positiveCount += (content.match(new RegExp(word, 'gi')) || []).length;
  });

  dict.negative.forEach(word => {
    negativeCount += (content.match(new RegExp(word, 'gi')) || []).length;
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
  try {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    // 支持中英文实体识别
    const patterns = {
      zh: /[一-龥][一-龥\d]*[一-龥]+/g,
      en: /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g
    };

    // 检测语言
    const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
    const matches = text.match(hasChineseChars ? patterns.zh : patterns.en) || [];

    // 规范化ID的辅助函数
    const normalizeId = (text) => {
      if (!text) return '';
      const cleanText = text.replace(/[*]/g, '').trim();
      // 移除已存在的 'node-' 前缀，避免重复添加
      const baseId = cleanText.startsWith('node-') ? cleanText.slice(5) : cleanText;
      // 统一处理特殊字符
      return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    };

    const entities = new Map(); // 使用 Map 来去重
    let entityId = 0;

    matches.forEach(match => {
      const cleanMatch = match.replace(/[*]/g, '').trim();
      if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
        const nodeId = normalizeId(cleanMatch);
        const entity = {
          id: nodeId,
          text: cleanMatch,
          label: cleanMatch,
          isEvent: hasEventIndicators(cleanMatch),
          isAttribute: hasAttributeIndicators(cleanMatch),
          importance: calculateImportance(cleanMatch, text),
          properties: {}
        };

        console.log('创建实体:', {
          ID: nodeId,
          文本: cleanMatch,
          类型: entity.isEvent ? 'event' : (entity.isAttribute ? 'attribute' : 'entity')
        });

        entities.set(cleanMatch, entity);
        // 同时用规范化ID作为键存储，以便后续查找
        entities.set(nodeId, entity);
      }
    });

    const result = Array.from(entities.values());
    // 去重，确保每个ID只出现一次
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

// 关系抽取函数
export const extractRelations = async (text) => {
  try {
    const relations = [];
    // 使用更细粒度的句子切分
    const sentences = text.split(/[，。！？.!?;；]/);
    let relationId = 0;

    // 规范化ID的辅助函数
    const normalizeId = (text) => {
      if (!text) return '';
      const cleanText = text.replace(/[*]/g, '').trim();
      // 移除已存在的 'node-' 前缀，避免重复添加
      const baseId = cleanText.startsWith('node-') ? cleanText.slice(5) : cleanText;
      // 统一处理特殊字符
      return `node-${baseId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    };

    // 扩展关系模式
    const patterns = [
      // 基础关系
      { regex: /([^，。！？]+?)是([^，。！？]+)/g, type: 'is-a', label: '是' },
      { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
      { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
      { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
      // 动作关系
      { regex: /([^，。！？]+?)进行([^，。！？]+)/g, type: 'performs', label: '进行' },
      { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
      { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供' },
      { regex: /([^，。！？]+?)获得([^，。！？]+)/g, type: 'obtains', label: '获得' },
      // 方向关系
      { regex: /([^，。！？]+?)到([^，。！？]+)/g, type: 'to', label: '到' },
      { regex: /([^，。！？]+?)从([^，。！？]+)/g, type: 'from', label: '从' },
      { regex: /([^，。！？]+?)对([^，。！？]+)/g, type: 'towards', label: '对' },
      // 时间关系
      { regex: /([^，。！？]+?)之前([^，。！？]+)/g, type: 'before', label: '之前' },
      { regex: /([^，。！？]+?)之后([^，。！？]+)/g, type: 'after', label: '之后' },
      { regex: /([^，。！？]+?)期间([^，。！？]+)/g, type: 'during', label: '期间' },
      // 条件关系
      { regex: /如果([^，。！？]+?)那么([^，。！？]+)/g, type: 'if-then', label: '如果-那么' },
      { regex: /([^，。！？]+?)因此([^，。！？]+)/g, type: 'therefore', label: '因此' },
      // 修饰关系
      { regex: /([^，。！？]+?)的([^，。！？]+)/g, type: 'of', label: '的' },
      { regex: /([^，。！？]+?)(很|非常|特别)([^，。！？]+)/g, type: 'degree', label: '程度' },
      // 并列关系
      { regex: /([^，。！？]+?)(和|与|以及|并且|而且)([^，。！？]+)/g, type: 'and', label: '并列' }
    ];

    // 处理每个句子
    let previousEntities = [];
    sentences.forEach(sentence => {
      // 提取当前句子中的实体
      const currentEntities = extractEntitiesFromSentence(sentence);
      
      // 处理模式匹配的关系
      patterns.forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
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

      // 添加上下文关系
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
                label: '上下文关联',
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

      // 处理句子内实体间的顺序关系
      for (let i = 0; i < currentEntities.length - 1; i++) {
        relations.push({
          id: `edge-${relationId++}`,
          source: {
            id: currentEntities[i].id,
            text: currentEntities[i].text
          },
          target: {
            id: currentEntities[i + 1].id,
            text: currentEntities[i + 1].text
          },
          type: 'sequence',
          label: '顺序关联',
          weight: 0.5,
          properties: {
            sourceText: currentEntities[i].text,
            targetText: currentEntities[i + 1].text
          }
        });
      }

      previousEntities = currentEntities;
    });

    // 添加语义相似度关系
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
            label: '相似',
            weight: similarity
          });
        }
      }
    }

    // 去重并返回关系
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
  return text.length >= 2 && !/^\d+$/.test(text);
};

const hasEventIndicators = (text) => {
  const eventPatterns = [
    /[了过着]$/,
    /^(开始|结束|发生|完成|启动)/,
    /(并|或|而|但|然后)/
  ];
  return eventPatterns.some(pattern => pattern.test(text));
};

const hasAttributeIndicators = (text) => {
  const attributePatterns = [
    /^(大小|长度|宽度|高度|深度|重量|颜色|形状)/,
    /(性|度|率|量|值|数|比)$/,
    /^(可以|能够|应该|必须|不能|不可以)/
  ];
  return attributePatterns.some(pattern => pattern.test(text));
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

const extractEntitiesFromSentence = (sentence) => {
  const matches = sentence.match(/[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g) || [];
  return matches
    .map(match => {
      const cleanMatch = match.replace(/[*]/g, '').trim();
      if (isValidEntity(cleanMatch)) {
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