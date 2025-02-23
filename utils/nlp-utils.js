import { relationPatterns, calculateRelationStrength, calculateRelationConfidence } from './relation-processor';

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
  try {
    // 确保输入文本有效
    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    const sentences = text.split(/[。！？.!?]/);
    const entities = new Map(); // 使用 Map 来去重
    let entityId = 0;

    sentences.forEach(sentence => {
      // 提取可能的实体（2个或更多连续的非标点字符）
      const matches = sentence.match(/[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g) || [];
      
      matches.forEach(match => {
        const cleanMatch = match.replace(/[*]/g, '').trim();
        if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
          const entity = {
            id: `node-${cleanMatch.replace(/[^a-zA-Z0-9]/g, '_')}`,
            text: cleanMatch,
            label: cleanMatch,
            isEvent: hasEventIndicators(cleanMatch),
            isAttribute: hasAttributeIndicators(cleanMatch),
            importance: calculateImportance(cleanMatch, text),
            properties: {}
          };
          entities.set(cleanMatch, entity);
        }
      });
    });

    const result = Array.from(entities.values());
    return result;
  } catch (error) {
    console.error('Error in extractEntities:', error);
    return [];
  }
};

// 关系抽取函数
export const extractRelations = async (text) => {
  try {
    const relations = [];
    const sentences = text.split(/[，。！？.!?;；]/);
    let relationId = 0;

    // 获取所有关系模式
    const allPatterns = [
      ...relationPatterns.hierarchical,
      ...relationPatterns.causal,
      ...relationPatterns.temporal,
      ...relationPatterns.functional,
      ...relationPatterns.spatial
    ];

    // 处理每个句子
    let previousEntities = [];
    sentences.forEach(sentence => {
      // 提取当前句子中的实体
      const currentEntities = extractEntitiesFromSentence(sentence);
      
      // 处理模式匹配的关系
      allPatterns.forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
              const sourceId = `node-${cleanSource.replace(/[^a-zA-Z0-9]/g, '_')}`;
              const targetId = `node-${cleanTarget.replace(/[^a-zA-Z0-9]/g, '_')}`;
              
              const relation = {
                id: `edge-${relationId++}`,
                source: sourceId,
                target: targetId,
                type: pattern.type,
                label: pattern.label,
                matched: true,
                frequency: 1,
                properties: {
                  sourceText: cleanSource,
                  targetText: cleanTarget,
                  context: sentence,
                  patternType: pattern.type,
                  category: Object.keys(relationPatterns).find(key => 
                    relationPatterns[key].includes(pattern)
                  )
                }
              };

              // 计算关系强度和可信度
              relation.weight = calculateRelationStrength(cleanSource, cleanTarget, text, pattern.type);
              relation.confidence = calculateRelationConfidence(relation, text);

              relations.push(relation);
            }
          }
        }
      });

      // 添加上下文关系（降低权重和可信度）
      if (previousEntities.length > 0 && currentEntities.length > 0) {
        previousEntities.forEach(prev => {
          currentEntities.forEach(curr => {
            if (prev.id !== curr.id) {
              const contextRelation = {
                id: `edge-${relationId++}`,
                source: prev.id,
                target: curr.id,
                type: 'context',
                label: '上下文关联',
                matched: false,
                frequency: 1,
                properties: {
                  sourceText: prev.text,
                  targetText: curr.text,
                  context: sentence,
                  category: 'contextual'
                }
              };

              // 计算上下文关系的强度和可信度
              contextRelation.weight = calculateRelationStrength(prev.text, curr.text, text, 'context') * 0.7;
              contextRelation.confidence = calculateRelationConfidence(contextRelation, text) * 0.8;

              relations.push(contextRelation);
            }
          });
        });
      }

      // 处理句子内实体间的顺序关系
      for (let i = 0; i < currentEntities.length - 1; i++) {
        const sequenceRelation = {
          id: `edge-${relationId++}`,
          source: currentEntities[i].id,
          target: currentEntities[i + 1].id,
          type: 'sequence',
          label: '顺序关联',
          matched: false,
          frequency: 1,
          properties: {
            sourceText: currentEntities[i].text,
            targetText: currentEntities[i + 1].text,
            context: sentence,
            category: 'sequential'
          }
        };

        // 计算顺序关系的强度和可信度
        sequenceRelation.weight = calculateRelationStrength(
          currentEntities[i].text,
          currentEntities[i + 1].text,
          text,
          'sequence'
        ) * 0.6;
        sequenceRelation.confidence = calculateRelationConfidence(sequenceRelation, text) * 0.7;

        relations.push(sequenceRelation);
      }

      previousEntities = currentEntities;
    });

    // 添加语义相似度关系
    const keywords = extractKeywords(text);
    for (let i = 0; i < keywords.length - 1; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const similarity = calculateSimilarity(keywords[i].text, keywords[j].text);
        if (similarity > 0.5) {
          const similarityRelation = {
            id: `edge-${relationId++}`,
            source: `node-${keywords[i].text.replace(/[^a-zA-Z0-9]/g, '_')}`,
            target: `node-${keywords[j].text.replace(/[^a-zA-Z0-9]/g, '_')}`,
            type: 'similar',
            label: '相似',
            matched: false,
            frequency: 1,
            properties: {
              sourceText: keywords[i].text,
              targetText: keywords[j].text,
              similarity: similarity,
              category: 'semantic'
            }
          };

          // 计算相似关系的强度和可信度
          similarityRelation.weight = similarity;
          similarityRelation.confidence = calculateRelationConfidence(similarityRelation, text) * 0.9;

          relations.push(similarityRelation);
        }
      }
    }

    // 过滤低质量关系并去重
    return relations
      .filter(relation => relation.weight > 0.3 && relation.confidence > 0.5)
      .filter((relation, index, self) => 
        index === self.findIndex(r => 
          r.source === relation.source && 
          r.target === relation.target && 
          r.type === relation.type
        )
      );

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

const calculateSimilarity = (text1, text2) => {
  // 简单的字符重叠相似度计算
  const set1 = new Set(text1);
  const set2 = new Set(text2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}; 