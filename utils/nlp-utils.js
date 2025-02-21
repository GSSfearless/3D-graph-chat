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

// 提取关系
export const extractRelations = (content) => {
  const sentences = content.split(/[。！？.!?]/);
  const nodes = new Set();
  const edges = [];
  const nodeTypes = ['concept', 'entity', 'action', 'property'];
  
  // 关键词提取
  const keywords = content.match(/[一-龥]{2,}/g) || [];
  keywords.forEach(word => {
    if (word.length >= 2) {
      nodes.add(word);
    }
  });

  // 基于语义的关系提取
  sentences.forEach(sentence => {
    const words = sentence.match(/[一-龥]{2,}/g) || [];
    if (words.length >= 2) {
      // 主题词（通常是句子开头的名词）
      const subject = words[0];
      
      // 对每个主题词，寻找相关的对象词
      words.slice(1).forEach(word => {
        if (word !== subject && nodes.has(word)) {
          // 判断关系类型
          let relationType = 'relation';
          if (sentence.includes('是') || sentence.includes('为')) {
            relationType = 'dependency';
          } else if (sentence.includes('影响') || sentence.includes('导致')) {
            relationType = 'influence';
          }
          
          edges.push({
            source: subject,
            target: word,
            weight: 1.0,  // 使用固定权重，避免随机性
            type: relationType
          });
        }
      });
    }
  });

  return {
    nodes: Array.from(nodes).map(text => ({
      text,
      weight: 1.0,  // 使用固定权重，避免随机性
      type: nodeTypes[0]  // 默认使用concept类型
    })),
    edges,
    categories: [
      { name: '概念' },
      { name: '实体' },
      { name: '动作' },
      { name: '属性' }
    ]
  };
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