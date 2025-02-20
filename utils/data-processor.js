import { extractKeywords, analyzeSentiment, extractRelations } from './nlp-utils';

export const processSearchResponse = (content) => {
  // 提取关键词和情感分析结果
  const keywords = extractKeywords(content);
  const sentiment = analyzeSentiment(content);
  const relations = extractRelations(content);

  // 构建图表数据
  return {
    // 3D标签云数据
    tagSphere: {
      tags: keywords.map(keyword => ({
        text: keyword.text,
        size: keyword.weight * 100,
        color: getSentimentColor(keyword.sentiment)
      }))
    },

    // 流体动画数据
    fluid: {
      points: keywords.map((keyword, index) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        value: keyword.weight * 100,
        size: keyword.weight * 20 + 10
      })),
      links: generateFluidLinks(keywords)
    },

    // 雷达图数据
    radar: {
      indicators: [
        { name: "相关性", max: 100 },
        { name: "重要性", max: 100 },
        { name: "新颖性", max: 100 },
        { name: "可信度", max: 100 },
        { name: "完整性", max: 100 }
      ],
      series: [
        {
          name: "分析结果",
          values: [
            sentiment.relevance * 100,
            sentiment.importance * 100,
            sentiment.novelty * 100,
            sentiment.credibility * 100,
            sentiment.completeness * 100
          ]
        }
      ]
    },

    // 地理气泡图数据
    geoBubble: {
      points: extractLocationData(content)
    },

    // 网络图数据
    network: {
      nodes: relations.nodes.map(node => ({
        name: node.text,
        value: node.weight * 100,
        size: node.weight * 30 + 10,
        category: node.type,
        color: getNodeColor(node.type)
      })),
      edges: relations.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.weight,
        color: getEdgeColor(edge.type)
      })),
      categories: relations.categories
    },

    // 声波图数据
    waveform: {
      values: generateWaveformData(sentiment.timeline),
      timestamps: generateTimestamps(sentiment.timeline.length)
    }
  };
};

// 辅助函数

const getSentimentColor = (sentiment) => {
  const colors = {
    positive: '#42b883',
    neutral: '#4a90e2',
    negative: '#dd1b16'
  };
  return colors[sentiment] || colors.neutral;
};

const generateFluidLinks = (keywords) => {
  const links = [];
  for (let i = 0; i < keywords.length - 1; i++) {
    if (Math.random() > 0.5) {
      links.push({
        source: i,
        target: i + 1,
        value: Math.random()
      });
    }
  }
  return links;
};

const extractLocationData = (content) => {
  // 这里应该实现地理位置信息提取
  // 示例数据
  return [
    { name: "北京", coordinates: [116.4074, 39.9042], value: 100 },
    { name: "上海", coordinates: [121.4737, 31.2304], value: 90 },
    { name: "广州", coordinates: [113.2644, 23.1291], value: 80 },
    { name: "深圳", coordinates: [114.0579, 22.5431], value: 85 }
  ];
};

const getNodeColor = (type) => {
  const colors = {
    concept: '#4a90e2',
    entity: '#42b883',
    action: '#dd1b16',
    property: '#f4e925'
  };
  return colors[type] || colors.concept;
};

const getEdgeColor = (type) => {
  const colors = {
    relation: 'rgba(74, 144, 226, 0.2)',
    dependency: 'rgba(66, 184, 131, 0.2)',
    influence: 'rgba(221, 27, 22, 0.2)'
  };
  return colors[type] || colors.relation;
};

const generateWaveformData = (timeline) => {
  if (!timeline || timeline.length === 0) {
    return Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 50 + Math.random() * 10
    );
  }
  return timeline.map(point => point.value * 100);
};

const generateTimestamps = (length) => {
  return Array.from({ length }, (_, i) => i);
}; 