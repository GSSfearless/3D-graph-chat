// 语言检测函数
const detectLanguage = (text) => {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  return chineseChars > englishChars ? 'zh' : 'en';
};

// 分词函数
const splitWords = (content) => {
  const lang = detectLanguage(content);
  if (lang === 'zh') {
    // 中文分词：按字符分，后续可以集成结巴分词等工具
    return content.match(/[\u4e00-\u9fa5]+/g) || [];
  } else {
    // 英文分词：考虑各种分隔符和特殊情况
    return content
      .split(/[\s,.!?;:()\[\]{}'"]+/)
      .filter(word => word.length > 0)
      .map(word => word.toLowerCase());
  }
};

// 提取关键词
export const extractKeywords = (content) => {
  const words = splitWords(content);
  const wordFreq = {};
  const lang = detectLanguage(content);
  
  // 计算词频
  words.forEach(word => {
    // 根据语言使用不同的清理规则
    const cleanWord = lang === 'zh' 
      ? word
      : word.toLowerCase().replace(/[^\w\s-]/g, '');
      
    if (cleanWord && (
      (lang === 'zh' && cleanWord.length >= 2) || 
      (lang === 'en' && cleanWord.length >= 3)
    )) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });

  // 计算TF-IDF分数
  const totalWords = words.length;
  const keywords = Object.entries(wordFreq)
    .map(([text, freq]) => {
      const tf = freq / totalWords;
      const importance = calculateImportance(text, content);
      return {
        text,
        weight: tf * importance,
        size: calculateNodeSize(text),
        color: generateNodeColor(text, lang),
        sentiment: analyzeSentimentForWord(text)
      };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);

  return keywords;
};

// 计算节点大小
const calculateNodeSize = (text) => {
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(text);
  const baseSize = hasChineseChars ? 70 : 100;
  const lengthFactor = Math.max(0.6, 1 - (text.length - 4) * 0.1);
  return baseSize * lengthFactor;
};

// 生成节点颜色
const generateNodeColor = (text, lang) => {
  const sentiment = analyzeSentimentForWord(text);
  const colors = {
    positive: ['#61dafb', '#42b883', '#3776ab'],
    neutral: ['#666666', '#888888', '#999999'],
    negative: ['#dd1b16', '#ff6b6b', '#ff8787']
  };
  
  const colorSet = colors[sentiment];
  const index = Math.floor(Math.random() * colorSet.length);
  return colorSet[index];
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

    // 改进的实体识别模式
    const patterns = {
      zh: {
        word: /[一-龥][一-龥\d]*[一-龥]+/g,
        phrase: /[一-龥]{2,}(?:的[一-龥]{2,})?/g
      },
      en: {
        word: /[A-Za-z]+(?:'[A-Za-z]+)*(?:-[A-Za-z]+)*/g,
        phrase: /[A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|and|or|of|in|on|at|to|for|with))*[a-z]*/g
      }
    };

    const lang = detectLanguage(text);
    const matches = new Set([
      ...(text.match(patterns[lang].word) || []),
      ...(text.match(patterns[lang].phrase) || [])
    ]);

    const entities = new Map();
    for (const match of matches) {
      const cleanMatch = match.trim();
      if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
        const nodeId = normalizeId(cleanMatch);
        const entity = {
          id: nodeId,
          text: cleanMatch,
          label: cleanMatch,
          size: calculateNodeSize(cleanMatch),
          color: generateNodeColor(cleanMatch, lang),
          isEvent: hasEventIndicators(cleanMatch),
          isAttribute: hasAttributeIndicators(cleanMatch),
          importance: calculateImportance(cleanMatch, text),
          properties: {
            language: lang,
            length: cleanMatch.length,
            type: getEntityType(cleanMatch)
          }
        };

        console.log('Creating entity:', {
          ID: nodeId,
          Text: cleanMatch,
          Type: entity.isEvent ? 'event' : (entity.isAttribute ? 'attribute' : 'entity'),
          Size: entity.size,
          Color: entity.color
        });

        entities.set(cleanMatch, entity);
      }
    }

    return Array.from(entities.values());
  } catch (error) {
    console.error('Error in extractEntities:', error);
    return [];
  }
};

// 获取实体类型
const getEntityType = (text) => {
  const patterns = {
    person: /^(?:[A-Z][a-z]+ )*[A-Z][a-z]+$|^[\u4e00-\u9fa5]{2,3}$/,
    organization: /(?:Inc\.|Corp\.|Ltd\.|LLC|Company|Group|公司|集团|企业)$/,
    location: /(?:Street|Road|Avenue|City|State|Country|省|市|区|街|路)$/,
    technology: /(?:API|SDK|Framework|Library|Platform|技术|框架|平台)$/,
    concept: /(?:Theory|Method|Process|Strategy|理论|方法|过程|策略)$/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return type;
  }
  return 'general';
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