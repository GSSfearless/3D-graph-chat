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
          // 修改ID生成方式，使用更简单的格式
          const entity = {
            id: `node_${entityId++}`,  // 使用数字ID
            text: cleanMatch,
            label: cleanMatch,
            isEvent: hasEventIndicators(cleanMatch),
            isAttribute: hasAttributeIndicators(cleanMatch),
            isConcept: hasConceptIndicators(cleanMatch),
            importance: calculateImportance(cleanMatch, text),
            properties: {}
          };
          entities.set(cleanMatch, entity);
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
    
    // 创建实体到ID的映射
    const entityToId = new Map();
    const entities = await extractEntities(text);
    entities.forEach(entity => {
      entityToId.set(entity.text, entity.id);
    });

    // 定义更丰富的关系模式
    const patterns = [
      { regex: /([^，。！？]+?)是([^，。！？]+)/g, type: 'is-a', label: '是' },
      { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
      { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
      { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
      { regex: /([^，。！？]+?)通过([^，。！？]+)/g, type: 'through', label: '通过' },
      { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
      { regex: /([^，。！？]+?)进行([^，。！？]+)/g, type: 'performs', label: '进行' },
      { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供' },
      { regex: /([^，。！？]+?)获得([^，。！？]+)/g, type: 'obtains', label: '获得' },
      { regex: /([^，。！？]+?)参与([^，。！？]+)/g, type: 'participates', label: '参与' },
      { regex: /([^，。！？]+?)了解([^，。！？]+)/g, type: 'understands', label: '了解' },
      { regex: /([^，。！？]+?)准备([^，。！？]+)/g, type: 'prepares', label: '准备' },
      { regex: /([^，。！？]+?)掌握([^，。！？]+)/g, type: 'masters', label: '掌握' },
      // 添加更多常见的中文关系模式
      { regex: /([^，。！？]+?)对([^，。！？]+)/g, type: 'towards', label: '对' },
      { regex: /([^，。！？]+?)与([^，。！？]+)/g, type: 'with', label: '与' },
      { regex: /([^，。！？]+?)和([^，。！？]+)/g, type: 'and', label: '和' },
      { regex: /([^，。！？]+?)在([^，。！？]+)/g, type: 'in', label: '在' },
      { regex: /([^，。！？]+?)为([^，。！？]+)/g, type: 'for', label: '为' },
      { regex: /([^，。！？]+?)由([^，。！？]+)/g, type: 'by', label: '由' }
    ];

    sentences.forEach(sentence => {
      // 对每个句子应用所有模式
      patterns.forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
              // 使用实体映射获取正确的ID
              const sourceId = entityToId.get(cleanSource);
              const targetId = entityToId.get(cleanTarget);
              
              if (sourceId && targetId) {
                relations.push({
                  id: `edge_${relationId++}`,
                  source: sourceId,
                  target: targetId,
                  type: pattern.type,
                  label: pattern.label,
                  weight: 1,
                  properties: {
                    sourceText: cleanSource,
                    targetText: cleanTarget
                  }
                });
              }
            }
          }
        }
      });

      // 处理并列关系
      const parallelPattern = /([^，。！？]+)[和与]([^，。！？]+)/g;
      let parallelMatch;
      while ((parallelMatch = parallelPattern.exec(sentence)) !== null) {
        const [, entity1, entity2] = parallelMatch;
        const cleanEntity1 = entity1.trim();
        const cleanEntity2 = entity2.trim();
        
        if (isValidEntity(cleanEntity1) && isValidEntity(cleanEntity2)) {
          const entity1Id = entityToId.get(cleanEntity1);
          const entity2Id = entityToId.get(cleanEntity2);
          
          if (entity1Id && entity2Id) {
            relations.push({
              id: `edge_${relationId++}`,
              source: entity1Id,
              target: entity2Id,
              type: 'related',
              label: '相关',
              weight: 0.5,
              properties: {
                sourceText: cleanEntity1,
                targetText: cleanEntity2
              }
            });
          }
        }
      }
    });

    console.log('Extracted relations:', relations);
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