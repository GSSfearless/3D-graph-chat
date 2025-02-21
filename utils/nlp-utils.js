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

// 添加一个统一的ID生成函数
const generateNodeId = (text) => {
  const normalized = text.toLowerCase().trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  return `node-${normalized}`;
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
    let entityId = 0;

    sentences.forEach(sentence => {
      const matches = sentence.match(/[一-龥A-Za-z][一-龥A-Za-z\d]*[一-龥A-Za-z]+/g) || [];
      
      matches.forEach(match => {
        const cleanMatch = match.replace(/[*]/g, '').trim();
        if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
          const nodeId = generateNodeId(cleanMatch);
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
          entities.set(cleanMatch, entity);
          // 同时用ID作为键存储
          entities.set(nodeId, entity);
        }
      });
    });

    const result = Array.from(entities.values());
    // 去重，确保每个ID只出现一次
    const uniqueResult = Array.from(new Map(result.map(item => [item.id, item])).values());
    console.log('Extracted entities:', uniqueResult);
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
    const sentences = text.split(/[。！？.!?]/);
    let relationId = 0;

    // 扩展关系模式，增加更多常见的中文关系表达
    const patterns = [
      // 基础关系
      { regex: /([^，。！？]+?)[是为]+([^，。！？]+)/g, type: 'is-a', label: '是' },
      { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
      { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
      // 动作关系
      { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
      { regex: /([^，。！？]+?)进行([^，。！？]+)/g, type: 'performs', label: '进行' },
      { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
      // 并列关系
      { regex: /([^，。！？]+?)[和与及]+([^，。！？]+)/g, type: 'and', label: '和' },
      // 修饰关系
      { regex: /([^，。！？]+?)的([^，。！？]+)/g, type: 'of', label: '的' },
      // 因果关系
      { regex: /([^，。！？]+?)导致([^，。！？]+)/g, type: 'causes', label: '导致' },
      { regex: /([^，。！？]+?)影响([^，。！？]+)/g, type: 'affects', label: '影响' },
      // 位置关系
      { regex: /([^，。！？]+?)在([^，。！？]+)/g, type: 'in', label: '在' },
      { regex: /([^，。！？]+?)到([^，。！？]+)/g, type: 'to', label: '到' }
    ];

    sentences.forEach(sentence => {
      // 对每个句子应用所有模式
      patterns.forEach(pattern => {
        let matches;
        pattern.regex.lastIndex = 0; // 重置正则表达式的lastIndex
        
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            // 清理和规范化文本
            const cleanSource = source.replace(/[*\s]/g, '').trim();
            const cleanTarget = target.replace(/[*\s]/g, '').trim();
            
            // 验证实体的有效性
            if (cleanSource && cleanTarget && 
                cleanSource !== cleanTarget && 
                isValidEntity(cleanSource) && 
                isValidEntity(cleanTarget)) {
              
              const sourceId = generateNodeId(cleanSource);
              const targetId = generateNodeId(cleanTarget);
              
              // 添加详细的调试信息
              console.log('Found relation:', {
                pattern: pattern.type,
                source: cleanSource,
                target: cleanTarget,
                sourceId,
                targetId,
                originalText: matches[0]
              });
              
              // 避免重复关系
              const relationKey = `${sourceId}-${pattern.type}-${targetId}`;
              if (!relations.some(r => 
                  r.source === sourceId && 
                  r.target === targetId && 
                  r.type === pattern.type)) {
                relations.push({
                  id: `edge-${relationId++}`,
                  source: sourceId,
                  target: targetId,
                  type: pattern.type,
                  label: pattern.label,
                  weight: 1,
                  properties: {
                    sourceText: cleanSource,
                    targetText: cleanTarget,
                    originalText: matches[0]
                  }
                });
              }
            }
          }
        }
      });

      // 处理特殊的并列关系
      const parallelPattern = /([^，。！？]+)[和与及]([^，。！？]+)/g;
      let parallelMatch;
      while ((parallelMatch = parallelPattern.exec(sentence)) !== null) {
        const [, entity1, entity2] = parallelMatch;
        const cleanEntity1 = entity1.replace(/[*\s]/g, '').trim();
        const cleanEntity2 = entity2.replace(/[*\s]/g, '').trim();
        
        if (cleanEntity1 && cleanEntity2 && 
            cleanEntity1 !== cleanEntity2 && 
            isValidEntity(cleanEntity1) && 
            isValidEntity(cleanEntity2)) {
          
          const entity1Id = generateNodeId(cleanEntity1);
          const entity2Id = generateNodeId(cleanEntity2);
          
          // 添加双向关系
          const relationKey1 = `${entity1Id}-parallel-${entity2Id}`;
          const relationKey2 = `${entity2Id}-parallel-${entity1Id}`;
          
          if (!relations.some(r => 
              (r.source === entity1Id && r.target === entity2Id) || 
              (r.source === entity2Id && r.target === entity1Id))) {
            relations.push({
              id: `edge-${relationId++}`,
              source: entity1Id,
              target: entity2Id,
              type: 'related',
              label: '相关',
              weight: 0.8,
              properties: {
                sourceText: cleanEntity1,
                targetText: cleanEntity2,
                originalText: parallelMatch[0]
              }
            });
          }
        }
      }
    });

    // 添加详细的调试信息
    console.log('Extracted relations details:', {
      totalRelations: relations.length,
      relationTypes: [...new Set(relations.map(r => r.type))],
      relations: relations
    });

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