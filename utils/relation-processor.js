// 关系模式定义
export const relationPatterns = {
  // 层次关系
  hierarchical: [
    { regex: /([^，。！？]+?)是一种([^，。！？]+)/g, type: 'isA', label: '是一种', weight: 0.8 },
    { regex: /([^，。！？]+?)属于([^，。！？]+)/g, type: 'belongsTo', label: '属于', weight: 0.8 },
    { regex: /([^，。！？]+?)包含([^，。！？]+)/g, type: 'hasPart', label: '包含', weight: 0.7 },
    { regex: /([^，。！？]+?)由([^，。！？]+?)组成/g, type: 'composedOf', label: '组成', weight: 0.7 }
  ],

  // 因果关系
  causal: [
    { regex: /([^，。！？]+?)导致([^，。！？]+)/g, type: 'causes', label: '导致', weight: 0.9 },
    { regex: /([^，。！？]+?)引起([^，。！？]+)/g, type: 'triggers', label: '引起', weight: 0.85 },
    { regex: /([^，。！？]+?)影响([^，。！？]+)/g, type: 'affects', label: '影响', weight: 0.7 },
    { regex: /如果([^，。！？]+?)就([^，。！？]+)/g, type: 'ifThen', label: '如果-就', weight: 0.8 }
  ],

  // 时序关系
  temporal: [
    { regex: /([^，。！？]+?)先于([^，。！？]+)/g, type: 'before', label: '先于', weight: 0.6 },
    { regex: /([^，。！？]+?)之后([^，。！？]+)/g, type: 'after', label: '之后', weight: 0.6 },
    { regex: /([^，。！？]+?)同时([^，。！？]+)/g, type: 'concurrent', label: '同时', weight: 0.7 },
    { regex: /([^，。！？]+?)期间([^，。！？]+)/g, type: 'during', label: '期间', weight: 0.65 }
  ],

  // 功能关系
  functional: [
    { regex: /([^，。！？]+?)用于([^，。！？]+)/g, type: 'usedFor', label: '用于', weight: 0.75 },
    { regex: /([^，。！？]+?)实现([^，。！？]+)/g, type: 'implements', label: '实现', weight: 0.8 },
    { regex: /([^，。！？]+?)支持([^，。！？]+)/g, type: 'supports', label: '支持', weight: 0.7 },
    { regex: /([^，。！？]+?)提供([^，。！？]+)/g, type: 'provides', label: '提供', weight: 0.75 }
  ],

  // 空间关系
  spatial: [
    { regex: /([^，。！？]+?)位于([^，。！？]+)/g, type: 'locatedIn', label: '位于', weight: 0.7 },
    { regex: /([^，。！？]+?)靠近([^，。！？]+)/g, type: 'nearTo', label: '靠近', weight: 0.6 },
    { regex: /([^，。！？]+?)包围([^，。！？]+)/g, type: 'surrounds', label: '包围', weight: 0.65 }
  ]
};

// 关系强度计算
export const calculateRelationStrength = (source, target, text, type) => {
  // 获取基础权重
  const baseWeight = getBaseWeight(type);
  
  // 计算共现强度
  const coOccurrence = calculateCoOccurrence(source, target, text);
  
  // 计算距离衰减
  const distance = calculateDistance(source, target, text);
  const distanceDecay = Math.exp(-distance * 0.1);
  
  // 计算语义相关性
  const semanticRelatedness = calculateSemanticRelatedness(source, target);
  
  return Math.min(1, baseWeight * (1 + coOccurrence) * distanceDecay * semanticRelatedness);
};

// 关系可信度计算
export const calculateRelationConfidence = (relation, text) => {
  // 基于模式匹配的确定性
  const patternConfidence = relation.matched ? 0.8 : 0.5;
  
  // 基于共现频率的可信度
  const freqConfidence = Math.min(1, relation.frequency / 10);
  
  // 基于上下文支持度
  const contextSupport = calculateContextSupport(relation, text);
  
  // 基于关系类型的可信度调整
  const typeConfidence = getTypeConfidence(relation.type);
  
  return (patternConfidence + freqConfidence + contextSupport + typeConfidence) / 4;
};

// 辅助函数
const getBaseWeight = (type) => {
  const weights = {
    isA: 0.8,
    belongsTo: 0.8,
    hasPart: 0.7,
    composedOf: 0.7,
    causes: 0.9,
    triggers: 0.85,
    affects: 0.7,
    ifThen: 0.8,
    before: 0.6,
    after: 0.6,
    concurrent: 0.7,
    during: 0.65,
    usedFor: 0.75,
    implements: 0.8,
    supports: 0.7,
    provides: 0.75,
    locatedIn: 0.7,
    nearTo: 0.6,
    surrounds: 0.65
  };
  return weights[type] || 0.5;
};

const calculateCoOccurrence = (source, target, text) => {
  try {
    const windowSize = 50; // 共现窗口大小
    const sourceRegex = new RegExp(source, 'g');
    const targetRegex = new RegExp(target, 'g');
    
    let coOccurrenceCount = 0;
    let sourceMatch;
    
    while ((sourceMatch = sourceRegex.exec(text)) !== null) {
      const start = Math.max(0, sourceMatch.index - windowSize);
      const end = Math.min(text.length, sourceMatch.index + windowSize);
      const window = text.substring(start, end);
      
      if (targetRegex.test(window)) {
        coOccurrenceCount++;
      }
    }
    
    return Math.min(1, coOccurrenceCount * 0.2);
  } catch (error) {
    console.error('Error calculating co-occurrence:', error);
    return 0.3;
  }
};

const calculateDistance = (source, target, text) => {
  try {
    const sourceIndex = text.indexOf(source);
    const targetIndex = text.indexOf(target);
    
    if (sourceIndex === -1 || targetIndex === -1) {
      return Infinity;
    }
    
    return Math.abs(sourceIndex - targetIndex);
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Infinity;
  }
};

const calculateSemanticRelatedness = (source, target) => {
  // 基于字符重叠的简单语义相关性计算
  const sourceChars = new Set(source);
  const targetChars = new Set(target);
  const intersection = new Set([...sourceChars].filter(x => targetChars.has(x)));
  const union = new Set([...sourceChars, ...targetChars]);
  
  return intersection.size / union.size;
};

const calculateContextSupport = (relation, text) => {
  try {
    // 在上下文窗口中寻找支持性词语
    const supportingWords = [
      '确实', '的确', '必然', '显然', '证明', '表明',
      '说明', '意味着', '因此', '所以', '由此可见'
    ];
    
    const contextWindow = 100; // 上下文窗口大小
    const sourceIndex = text.indexOf(relation.properties.sourceText);
    
    if (sourceIndex === -1) {
      return 0.5;
    }
    
    const start = Math.max(0, sourceIndex - contextWindow);
    const end = Math.min(text.length, sourceIndex + contextWindow);
    const context = text.substring(start, end);
    
    let supportCount = 0;
    supportingWords.forEach(word => {
      if (context.includes(word)) {
        supportCount++;
      }
    });
    
    return Math.min(1, 0.5 + (supportCount * 0.1));
  } catch (error) {
    console.error('Error calculating context support:', error);
    return 0.5;
  }
};

const getTypeConfidence = (type) => {
  const confidences = {
    isA: 0.9,
    belongsTo: 0.85,
    hasPart: 0.8,
    causes: 0.85,
    affects: 0.75,
    before: 0.8,
    after: 0.8,
    usedFor: 0.8,
    implements: 0.85,
    locatedIn: 0.9
  };
  return confidences[type] || 0.7;
}; 