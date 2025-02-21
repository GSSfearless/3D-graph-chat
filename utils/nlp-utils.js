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
    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    const sentences = text.split(/[。！？.!?]/);
    const entities = new Map();
    const entityTexts = new Set(); // 用于存储已处理的实体文本

    sentences.forEach(sentence => {
      // 先尝试提取较长的实体
      const matches = sentence.match(/[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g) || [];
      
      matches.sort((a, b) => b.length - a.length); // 按长度降序排序
      
      matches.forEach(match => {
        const cleanMatch = match.replace(/[*]/g, '').trim();
        // 检查是否已经包含在其他实体中
        const isSubstring = Array.from(entityTexts).some(text => 
          text !== cleanMatch && text.includes(cleanMatch)
        );
        
        if (!isSubstring && isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
          const nodeId = `node-${hashString(cleanMatch)}`;
          const entity = {
            id: nodeId,
            text: cleanMatch,
            label: cleanMatch,
            isEvent: hasEventIndicators(cleanMatch),
            isAttribute: hasAttributeIndicators(cleanMatch),
            isConcept: hasConceptIndicators(cleanMatch),
            importance: calculateImportance(cleanMatch, text),
            properties: {}
          };
          console.log('Created entity:', entity);
          entities.set(cleanMatch, entity);
          entityTexts.add(cleanMatch);
        }
      });
    });

    const result = Array.from(entities.values());
    console.log('Extracted entities:', result);
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
    const sentences = text.split(/[。！？.!?]/);
    let relationId = 0;

    // 创建实体映射
    const entities = await extractEntities(text);
    const entityMap = new Map(entities.map(entity => [entity.text, entity]));
    const entityIds = new Set(entities.map(entity => entity.id));
    
    console.log('Entity map:', entityMap);

    // 定义关系模式
    const patterns = [
      { regex: /(.{2,20}?)是(.{2,20})/g, type: 'is-a', label: '是' },
      { regex: /(.{2,20}?)包含(.{2,20})/g, type: 'contains', label: '包含' },
      { regex: /(.{2,20}?)属于(.{2,20})/g, type: 'belongs-to', label: '属于' },
      { regex: /(.{2,20}?)和(.{2,20})/g, type: 'and', label: '和' },
      { regex: /(.{2,20}?)与(.{2,20})/g, type: 'with', label: '与' },
      { regex: /(.{2,20}?)通过(.{2,20})/g, type: 'through', label: '通过' }
    ];

    const findMatchingEntity = (text) => {
      // 按长度降序排序实体，优先匹配较长的实体
      const sortedEntities = Array.from(entityMap.entries())
        .sort(([a], [b]) => b.length - a.length);
      
      for (const [entityText, entity] of sortedEntities) {
        if (text.includes(entityText)) {
          return entity;
        }
      }
      return null;
    };

    sentences.forEach(sentence => {
      const cleanSentence = sentence.trim().replace(/\s+/g, '');
      if (!cleanSentence) return;

      console.log('Processing sentence:', cleanSentence);

      // 处理每个关系模式
      patterns.forEach(pattern => {
        const regex = new RegExp(pattern.regex);
        let match;
        
        while ((match = regex.exec(cleanSentence)) !== null) {
          if (match && match.length >= 3) {
            const sourceText = match[1].trim();
            const targetText = match[2].trim();
            
            const sourceEntity = findMatchingEntity(sourceText);
            const targetEntity = findMatchingEntity(targetText);
            
            if (sourceEntity && targetEntity && 
                sourceEntity.id !== targetEntity.id &&
                entityIds.has(sourceEntity.id) && 
                entityIds.has(targetEntity.id)) {
              
              const relation = {
                id: `edge-${relationId++}`,
                source: sourceEntity.id,
                target: targetEntity.id,
                type: pattern.type,
                label: pattern.label,
                weight: 1,
                properties: {
                  sourceText: sourceEntity.text,
                  targetText: targetEntity.text
                }
              };
              
              console.log('Created relation:', relation);
              relations.push(relation);
            }
          }
        }
      });

      // 处理并列关系
      const parallelMatches = cleanSentence.match(/(.{2,20})[和与](.{2,20})/g) || [];
      parallelMatches.forEach(match => {
        const parts = match.split(/[和与]/);
        if (parts.length === 2) {
          const [part1, part2] = parts.map(p => p.trim());
          
          const entity1 = findMatchingEntity(part1);
          const entity2 = findMatchingEntity(part2);
          
          if (entity1 && entity2 && 
              entity1.id !== entity2.id &&
              entityIds.has(entity1.id) && 
              entityIds.has(entity2.id)) {
            
            const relation = {
              id: `edge-${relationId++}`,
              source: entity1.id,
              target: entity2.id,
              type: 'related',
              label: '相关',
              weight: 0.5,
              properties: {
                sourceText: entity1.text,
                targetText: entity2.text
              }
            };
            
            console.log('Created parallel relation:', relation);
            relations.push(relation);
          }
        }
      });
    });

    console.log('Final extracted relations:', relations);
    return relations;
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

// 添加哈希函数
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // 确保哈希值为正数并且不超过一定长度
  return Math.abs(hash).toString(36).substring(0, 8);
}; 