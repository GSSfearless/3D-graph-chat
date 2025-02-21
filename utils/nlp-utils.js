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

// 修改ID生成函数
const generateNodeId = (text) => {
  // 对于较长的中文文本，提取关键词
  let processedText = text;
  if (text.length > 10) {
    // 提取最后一个动词或名词短语
    const keywords = text.match(/[一-龥]+(?:的)?[一-龥]+$/);
    if (keywords) {
      processedText = keywords[0];
    } else {
      // 如果没有找到合适的短语，取最后几个字
      processedText = text.slice(-5);
    }
  }
  
  // 规范化文本
  const normalized = processedText
    .toLowerCase()
    .trim()
    .replace(/[的地得了过着]/g, '')  // 移除常见虚词
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    
  return `node-${normalized}`;
};

// 计算节点大小
const calculateNodeSize = (entity, text) => {
  try {
    let baseSize = 10;  // 基础大小
    let importanceMultiplier = 1;  // 重要性乘数
    let typeMultiplier = 1;  // 类型乘数

    // 根据实体类型调整大小
    if (entity.isEvent) {
      typeMultiplier = 1.5;  // 事件节点稍大
    } else if (entity.isConcept) {
      typeMultiplier = 1.8;  // 概念节点最大
    } else if (entity.isAttribute) {
      typeMultiplier = 0.8;  // 属性节点稍小
    }

    // 计算文本重要性
    const frequency = calculateFrequency(entity.text, text);
    const length = entity.text.length;
    const positionWeight = calculatePositionWeight(entity.text, text);
    
    // 重要性分数计算
    importanceMultiplier = Math.min(2.5, (
      frequency * 0.4 +  // 频率权重
      Math.min(length / 4, 1) * 0.3 +  // 长度权重（最多贡献0.3）
      positionWeight * 0.3  // 位置权重
    ));

    // 最终大小计算
    const finalSize = baseSize * typeMultiplier * importanceMultiplier;
    
    // 确保大小在合理范围内
    return Math.max(8, Math.min(25, finalSize));
  } catch (error) {
    console.error('计算节点大小时出错:', error);
    return 10;  // 返回默认大小
  }
};

// 计算词频
const calculateFrequency = (term, text) => {
  try {
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedTerm, 'g');
    const matches = text.match(regex) || [];
    return Math.min(1 + (matches.length * 0.2), 2);  // 最多贡献2倍大小
  } catch (error) {
    console.error('计算词频时出错:', error);
    return 1;
  }
};

// 计算位置权重（句首句尾的词更重要）
const calculatePositionWeight = (term, text) => {
  try {
    const sentences = text.split(/[。！？.!?]/);
    let weight = 1;
    
    for (const sentence of sentences) {
      if (sentence.trim().startsWith(term) || sentence.trim().endsWith(term)) {
        weight += 0.2;  // 句首句尾加权
      }
    }
    
    return Math.min(weight, 1.6);  // 最多贡献1.6倍大小
  } catch (error) {
    console.error('计算位置权重时出错:', error);
    return 1;
  }
};

// 修改实体提取模式
const entityPatterns = {
  // 核心概念（2-6个字的名词）
  CONCEPT: /(?:[一-龥]{2,6}(?:概念|理论|方法|系统|原理|思想|观点|主义))|(?:(?:概念|理论|方法|系统|原理)(?:[一-龥]{2,6}))/g,
  
  // 动作（2-8个字的动词短语）
  ACTION: /[一-龥]{2,4}(?:进行|开展|使用|需要|获得|完成)[一-龥]{0,4}/g,
  
  // 状态（2-6个字的状态描述）
  STATE: /[一-龥]{2,6}(?:状态|情况|阶段|过程|水平)/g,
  
  // 属性（2-6个字的属性描述）
  ATTRIBUTE: /(?:[一-龥]{2,6}(?:的|之|与))?[一-龥]{2,6}(?:特征|特点|性质|程度|等级|品质)/g,
  
  // 关键短语（3-8个字的重要短语）
  KEY_PHRASE: /[一-龥]{3,8}(?:是|的|之|与)[一-龥]{2,6}/g
};

// 改进实体提取函数
export const extractEntities = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid input text in extractEntities');
      return [];
    }

    const sentences = text.split(/[。！？.!?]/);
    const entities = new Map();

    // 处理每个句子
    sentences.forEach(sentence => {
      // 对每种模式进行匹配
      Object.entries(entityPatterns).forEach(([type, pattern]) => {
        const matches = sentence.match(pattern) || [];
        matches.forEach(match => {
          // 清理和规范化文本
          const cleanMatch = match.replace(/[*\s]/g, '').trim()
            .replace(/^[的之与]|[的之与]$/, '')  // 移除首尾的虚词
            .replace(/[，。、；：！？]+/g, '');   // 移除标点符号
          
          if (isValidEntity(cleanMatch) && !entities.has(cleanMatch)) {
            // 提取核心短语
            const corePhrase = extractCorePhrase(cleanMatch);
            const nodeId = generateNodeId(corePhrase);
            
            const entity = {
              id: nodeId,
              text: cleanMatch,
              label: corePhrase,
              type: type.toLowerCase(),
              isEvent: type === 'ACTION',
              isAttribute: type === 'ATTRIBUTE',
              isConcept: type === 'CONCEPT',
              size: calculateNodeSize({ 
                text: corePhrase,
                type: type.toLowerCase(),
                isEvent: type === 'ACTION',
                isAttribute: type === 'ATTRIBUTE',
                isConcept: type === 'CONCEPT'
              }, text),
              properties: {
                originalText: cleanMatch,
                corePhrase: corePhrase,
                entityType: type
              }
            };
            
            // 存储实体的多种形式
            entities.set(cleanMatch, entity);
            entities.set(nodeId, entity);
            entities.set(corePhrase, entity);
            entities.set(corePhrase.toLowerCase(), entity);
          }
        });
      });
    });

    const result = Array.from(entities.values());
    const uniqueResult = Array.from(new Map(result.map(item => [item.id, item])).values());
    
    console.log('Extracted entities:', uniqueResult.map(e => ({
      text: e.text,
      label: e.label,
      id: e.id,
      type: e.type,
      size: e.size
    })));
    
    return uniqueResult;
  } catch (error) {
    console.error('Error in extractEntities:', error);
    return [];
  }
};

// 提取核心短语
const extractCorePhrase = (text) => {
  // 如果文本较短，直接返回
  if (text.length <= 6) return text;
  
  // 尝试提取核心短语的模式
  const patterns = [
    // 提取"XXX的YYY"中的YYY
    /^.+的(.{2,6})$/,
    // 提取"XXX是YYY"中的YYY
    /^.+是(.{2,6})$/,
    // 提取最后2-6个字
    /(.{2,6})$/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // 如果没有匹配到任何模式，返回最后6个字
  return text.slice(-6);
};

// 修改关系提取函数中的模式
const relationPatterns = [
  // 定义关系
  { regex: /(.{2,8})是(.{2,8})/g, type: 'is-a', label: '是' },
  { regex: /(.{2,8})为(.{2,8})/g, type: 'is-a', label: '为' },
  // 包含关系
  { regex: /(.{2,8})包含(.{2,8})/g, type: 'contains', label: '包含' },
  { regex: /(.{2,8})涵盖(.{2,8})/g, type: 'contains', label: '涵盖' },
  // 属性关系
  { regex: /(.{2,8})的(.{2,8})/g, type: 'has', label: '的' },
  { regex: /(.{2,8})具有(.{2,8})/g, type: 'has', label: '具有' },
  // 动作关系
  { regex: /(.{2,8})进行(.{2,8})/g, type: 'performs', label: '进行' },
  { regex: /(.{2,8})需要(.{2,8})/g, type: 'requires', label: '需要' },
  // 并列关系
  { regex: /(.{2,8})[和与及](.{2,8})/g, type: 'and', label: '和' }
];

// 修改关系提取函数中的验证逻辑
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
      patterns.forEach(pattern => {
        let matches;
        pattern.regex.lastIndex = 0;
        
        while ((matches = pattern.regex.exec(sentence)) !== null) {
          if (matches && matches.length >= 3) {
            const [, source, target] = matches;
            const cleanSource = source.replace(/[*\s]/g, '').trim();
            const cleanTarget = target.replace(/[*\s]/g, '').trim();
            
            // 使用改进的实体验证
            if (isValidEntityPair(cleanSource, cleanTarget)) {
              const sourceId = generateNodeId(cleanSource);
              const targetId = generateNodeId(cleanTarget);
              
              console.log('Found relation:', {
                pattern: pattern.type,
                source: cleanSource,
                target: cleanTarget,
                sourceId,
                targetId,
                originalText: matches[0]
              });
              
              // 避免重复关系
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

const isValidEntityPair = (source, target) => {
  // 检查源实体和目标实体是否有效
  if (!source || !target || source === target) {
    return false;
  }

  // 确保实体不是常见的无意义词组
  const invalidWords = ['这个', '那个', '什么', '怎么', '为什么', '如何'];
  if (invalidWords.some(word => source.includes(word) || target.includes(word))) {
    return false;
  }

  // 检查实体长度
  if (source.length < 2 || target.length < 2) {
    return false;
  }

  // 使用原有的实体验证逻辑
  return isValidEntity(source) && isValidEntity(target);
}; 