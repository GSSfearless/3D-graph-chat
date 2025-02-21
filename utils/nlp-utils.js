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
          const importance = calculateImportance(cleanMatch, text);
          const entity = {
            id: `node-${cleanMatch.replace(/[^a-zA-Z0-9]/g, '_')}`,
            text: cleanMatch,
            label: cleanMatch,
            isEvent: hasEventIndicators(cleanMatch),
            isAttribute: hasAttributeIndicators(cleanMatch),
            isConcept: hasConceptIndicators(cleanMatch),
            importance: importance,
            // 根据重要性计算节点大小
            size: 10 + (importance * 20), // 节点大小从10到30不等
            properties: {
              frequency: (text.match(new RegExp(cleanMatch, 'g')) || []).length,
              importance: importance
            }
          };
          entities.set(cleanMatch, entity);
        }
      });
    });

    const result = Array.from(entities.values());
    console.log('Extracted entities with sizes:', result.map(e => ({
      text: e.text,
      importance: e.importance,
      size: e.size
    })));
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

    // 定义更丰富的关系模式
    const patterns = [
      // 基本关系
      { regex: /([^，。！？]+?)是([^，。！？]+)/g, type: 'is-a', label: '是' },
      { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'contains', label: '包含' },
      { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongs-to', label: '属于' },
      { regex: /([^，。！？]+?)需要([^，。！？]+)/g, type: 'requires', label: '需要' },
      
      // 动作关系
      { regex: /([^，。！？]+?)通过([^，。！？]+)/g, type: 'through', label: '通过' },
      { regex: /([^，。！？]+?)使用([^，。！？]+)/g, type: 'uses', label: '使用' },
      { regex: /([^，。！？]+?)进行([^，。！？]+)/g, type: 'performs', label: '进行' },
      { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供' },
      { regex: /([^，。！？]+?)获得([^，。！？]+)/g, type: 'obtains', label: '获得' },
      { regex: /([^，。！？]+?)参与([^，。！？]+)/g, type: 'participates', label: '参与' },
      
      // 认知关系
      { regex: /([^，。！？]+?)了解([^，。！？]+)/g, type: 'understands', label: '了解' },
      { regex: /([^，。！？]+?)准备([^，。！？]+)/g, type: 'prepares', label: '准备' },
      { regex: /([^，。！？]+?)掌握([^，。！？]+)/g, type: 'masters', label: '掌握' },
      { regex: /([^，。！？]+?)学习([^，。！？]+)/g, type: 'learns', label: '学习' },
      { regex: /([^，。！？]+?)研究([^，。！？]+)/g, type: 'studies', label: '研究' },
      
      // 修饰关系
      { regex: /([^，。！？]+?)的([^，。！？]+)/g, type: 'of', label: '的' },
      { regex: /([^，。！？]+?)对([^，。！？]+)/g, type: 'towards', label: '对' },
      { regex: /([^，。！？]+?)与([^，。！？]+)/g, type: 'with', label: '与' },
      { regex: /([^，。！？]+?)和([^，。！？]+)/g, type: 'and', label: '和' },
      { regex: /([^，。！？]+?)在([^，。！？]+)/g, type: 'in', label: '在' },
      { regex: /([^，。！？]+?)为([^，。！？]+)/g, type: 'for', label: '为' },
      { regex: /([^，。！？]+?)由([^，。！？]+)/g, type: 'by', label: '由' },
      
      // 因果关系
      { regex: /([^，。！？]+?)导致([^，。！？]+)/g, type: 'causes', label: '导致' },
      { regex: /([^，。！？]+?)引起([^，。！？]+)/g, type: 'triggers', label: '引起' },
      { regex: /([^，。！？]+?)促进([^，。！？]+)/g, type: 'promotes', label: '促进' },
      
      // 时序关系
      { regex: /([^，。！？]+?)之前([^，。！？]+)/g, type: 'before', label: '之前' },
      { regex: /([^，。！？]+?)之后([^，。！？]+)/g, type: 'after', label: '之后' },
      { regex: /([^，。！？]+?)期间([^，。！？]+)/g, type: 'during', label: '期间' }
    ];

    // 处理每个句子
    sentences.forEach(sentence => {
      // 对每个句子应用所有模式
      patterns.forEach(pattern => {
        let matches;
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            // 清理和验证实体
            const cleanSource = source.replace(/[*]/g, '').trim();
            const cleanTarget = target.replace(/[*]/g, '').trim();
            
            if (isValidEntity(cleanSource) && isValidEntity(cleanTarget)) {
              // 为源节点和目标节点创建规范化的ID
              const sourceId = `node-${cleanSource.replace(/[^a-zA-Z0-9]/g, '_')}`;
              const targetId = `node-${cleanTarget.replace(/[^a-zA-Z0-9]/g, '_')}`;
              
              // 添加调试日志
              console.log('Creating relation:', {
                source: cleanSource,
                target: cleanTarget,
                sourceId,
                targetId,
                type: pattern.type,
                label: pattern.label
              });
              
              // 创建关系
              relations.push({
                id: `edge-${relationId++}`,
                source: sourceId,
                target: targetId,
                type: pattern.type,
                label: pattern.label,
                weight: calculateRelationWeight(pattern.type),
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

      // 处理并列关系
      const parallelPatterns = [
        { regex: /([^，。！？]+)[和与及]([^，。！？]+)/g, type: 'parallel', label: '相关' },
        { regex: /([^，。！？]+)[、]([^，。！？]+)/g, type: 'parallel', label: '相关' }
      ];

      parallelPatterns.forEach(pattern => {
        let parallelMatch;
        while ((parallelMatch = pattern.regex.exec(sentence)) !== null) {
          const [, entity1, entity2] = parallelMatch;
          const cleanEntity1 = entity1.trim();
          const cleanEntity2 = entity2.trim();
          
          if (isValidEntity(cleanEntity1) && isValidEntity(cleanEntity2)) {
            const entity1Id = `node-${cleanEntity1.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const entity2Id = `node-${cleanEntity2.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            // 添加双向关系
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
                context: sentence,
                bidirectional: true
              }
            });
          }
        }
      });
    });

    // 添加调试日志
    console.log('Extracted relations:', relations);
    return relations;
  } catch (error) {
    console.error('Error in extractRelations:', error);
    return [];
  }
};

// 计算关系权重
const calculateRelationWeight = (type) => {
  const weights = {
    'is-a': 1.0,
    'contains': 0.9,
    'belongs-to': 0.9,
    'requires': 0.8,
    'through': 0.7,
    'uses': 0.7,
    'performs': 0.7,
    'provides': 0.7,
    'obtains': 0.7,
    'participates': 0.7,
    'understands': 0.6,
    'prepares': 0.6,
    'masters': 0.6,
    'learns': 0.6,
    'studies': 0.6,
    'of': 0.5,
    'towards': 0.5,
    'with': 0.5,
    'and': 0.5,
    'in': 0.5,
    'for': 0.5,
    'by': 0.5,
    'causes': 0.8,
    'triggers': 0.8,
    'promotes': 0.7,
    'before': 0.6,
    'after': 0.6,
    'during': 0.6,
    'default': 0.5
  };
  return weights[type] || weights.default;
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
    
    // 计算实体在文本中的出现频率
    const frequency = (fullText.match(regex) || []).length;
    
    // 计算实体的长度权重（较长的实体可能更重要）
    const lengthWeight = Math.min(1, entity.length / 10);
    
    // 计算实体的位置权重（句子开头的实体可能更重要）
    const sentences = fullText.split(/[。！？.!?]/);
    let positionWeight = 0;
    sentences.forEach(sentence => {
      if (sentence.trim().startsWith(entity)) {
        positionWeight += 0.2;
      }
    });
    
    // 特殊标记的权重（如果实体是事件、概念或属性）
    let typeWeight = 0;
    if (hasEventIndicators(entity)) typeWeight += 0.3;
    if (hasConceptIndicators(entity)) typeWeight += 0.2;
    if (hasAttributeIndicators(entity)) typeWeight += 0.1;
    
    // 综合计算重要性分数
    const importance = Math.min(1, 
      0.3 + // 基础分数
      (frequency * 0.15) + // 频率权重
      (lengthWeight * 0.2) + // 长度权重
      (positionWeight * 0.15) + // 位置权重
      (typeWeight * 0.2) // 类型权重
    );
    
    console.log('Entity importance calculation:', {
      entity,
      frequency,
      lengthWeight,
      positionWeight,
      typeWeight,
      finalImportance: importance
    });
    
    return importance;
  } catch (error) {
    console.error('计算重要性时出错:', error);
    return 0.3; // 返回默认重要性
  }
}; 