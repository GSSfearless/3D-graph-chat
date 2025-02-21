import { NLPProcessor } from './nlp-processor';

export class KnowledgeProcessor {
  constructor() {
    this.nlp = new NLPProcessor();
    this.nodeTypes = {
      CONCEPT: 'concept',
      ENTITY: 'entity',
      EVENT: 'event',
      PROPERTY: 'property',
      RELATION: 'relation'
    };

    this.relationTypes = {
      IS_A: 'is_a',
      PART_OF: 'part_of',
      HAS_PROPERTY: 'has_property',
      RELATED_TO: 'related_to',
      CAUSES: 'causes',
      BELONGS_TO: 'belongs_to'
    };
  }

  // 处理搜索响应，生成知识图谱数据
  processSearchResponse(text) {
    // 1. 使用NLP提取关键信息
    const { entities, relations } = this.nlp.extractKnowledge(text);
    
    // 2. 构建节点
    const nodes = entities.map((entity, index) => ({
      id: `node-${index}`,
      data: {
        id: `node-${index}`,
        label: entity.text,
        type: entity.type,
        weight: entity.importance || 1,
        // 使用球面坐标系计算初始位置
        position: this.calculateSpherePosition(index, entities.length)
      }
    }));

    // 3. 构建边
    const edges = relations.map((relation, index) => ({
      id: `edge-${index}`,
      data: {
        id: `edge-${index}`,
        source: `node-${relation.source}`,
        target: `node-${relation.target}`,
        label: relation.type,
        weight: relation.strength || 1
      }
    }));

    // 4. 返回图谱数据
    return {
      nodes,
      edges,
      // 添加布局配置
      layout: {
        type: '3d-force',
        options: {
          strength: -1000,  // 节点间斥力
          distance: 200,    // 理想边长
          decay: 0.9,      // 力导向衰减系数
          gravity: 0.1     // 向心力
        }
      }
    };
  }

  // 计算球面上的均匀分布位置
  calculateSpherePosition(index, total) {
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 200;

    return {
      x: radius * Math.cos(theta) * Math.sin(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(phi)
    };
  }

  // 从文本中提取知识元素
  extractKnowledgeElements(text) {
    const concepts = new Set();
    const entities = new Set();
    const relations = new Map();

    // 分句处理
    const sentences = text.split(/[。！？.!?]/);
    
    sentences.forEach(sentence => {
      // 提取概念（通常是抽象的名词短语）
      const conceptMatches = sentence.match(/([一个])?([的地得])?([^，。！？,!?]{2,})/g) || [];
      conceptMatches.forEach(match => {
        if (this.isValidConcept(match)) {
          concepts.add(match.trim());
        }
      });

      // 提取实体（具体的人、物、地点等）
      const entityMatches = sentence.match(/([的])?([^，。！？,!?]{2,})/g) || [];
      entityMatches.forEach(match => {
        if (this.isValidEntity(match)) {
          entities.add(match.trim());
        }
      });

      // 提取关系
      this.extractRelations(sentence, relations);
    });

    return {
      concepts: Array.from(concepts),
      entities: Array.from(entities),
      relations: Array.from(relations.entries()).map(([key, value]) => ({
        source: value.source,
        target: value.target,
        type: value.type
      }))
    };
  }

  // 构建图数据
  buildGraphData(concepts, entities, relations) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 添加概念节点
    concepts.forEach(concept => {
      const nodeId = this.generateId(concept);
      nodes.push({
        data: {
          id: nodeId,
          label: concept,
          type: this.nodeTypes.CONCEPT,
          category: 0
        }
      });
      nodeMap.set(concept, nodeId);
    });

    // 添加实体节点
    entities.forEach(entity => {
      const nodeId = this.generateId(entity);
      nodes.push({
        data: {
          id: nodeId,
          label: entity,
          type: this.nodeTypes.ENTITY,
          category: 1
        }
      });
      nodeMap.set(entity, nodeId);
    });

    // 添加关系边
    relations.forEach(relation => {
      const sourceId = nodeMap.get(relation.source);
      const targetId = nodeMap.get(relation.target);
      
      if (sourceId && targetId) {
        edges.push({
          data: {
            source: sourceId,
            target: targetId,
            label: this.getRelationLabel(relation.type),
            type: relation.type
          }
        });
      }
    });

    return {
      nodes,
      edges
    };
  }

  // 验证概念有效性
  isValidConcept(text) {
    const invalidPatterns = [
      /^[的地得]/, // 开头是的地得
      /^[和与或而且但是然后因此所以总之以下等等]/, // 开头是连接词
      /^[了过着]/, // 开头是时态词
      /^\d+$/, // 纯数字
      /^[一二三四五六七八九十百千万亿]+$/, // 中文数字
      /^[1-9]\.?$/, // 序号（如1. 2.）
      /^[①②③④⑤⑥⑦⑧⑨⑩]/, // 圆圈数字
      /^[,.，。、；：！？]/, // 标点符号
      /^[的地得之].*[的地得之]$/, // 前后都是助词
      /^(这|那|此|该|这些|那些|这样|那样)/, // 指示代词
      /^(就是|也是|还是|即是|乃是)/, // 判断词
      /^(有|没有|不是|不能|不可以)/, // 否定词
      /^(在|于|对于|关于)/, // 介词
      /[，。、；：！？]+/ // 包含标点符号
    ];

    const minLength = 2; // 最小长度
    const maxLength = 20; // 最大长度

    return text.length >= minLength && 
           text.length <= maxLength && 
           !invalidPatterns.some(pattern => pattern.test(text)) &&
           !/^[a-zA-Z0-9_]+$/.test(text); // 不是纯英文或数字
  }

  // 验证实体有效性
  isValidEntity(text) {
    const invalidPatterns = [
      /^[的地得]/, // 不以的地得开头
      /^[和与或而且但是然后因此所以总之以下等等]/, // 不以连接词开头
      /^\d+$/, // 不是纯数字
      /^[一二三四五六七八九十百千万亿]+$/, // 不是纯中文数字
      /^[1-9]\.?$/, // 不是序号
      /^[①②③④⑤⑥⑦⑧⑨⑩]/, // 不是圆圈数字
      /^[,.，。、；：！？]/, // 不是标点符号
      /^(这|那|此|该|这些|那些|这样|那样)/, // 不是指示代词
      /^(就是|也是|还是|即是|乃是)/, // 不是判断词
      /[，。、；：！？]+/ // 不包含标点符号
    ];

    const minLength = 2; // 最小长度
    const maxLength = 20; // 最大长度

    return text.length >= minLength && 
           text.length <= maxLength && 
           !invalidPatterns.some(pattern => pattern.test(text));
  }

  // 提取关系
  extractRelations(sentence, relations) {
    // 是...的关系
    const isPattern = /(.+)是(.+)的?/;
    // 包含...的关系
    const containsPattern = /(.+)包含(.+)的?/;
    // 属于...的关系
    const belongsPattern = /(.+)属于(.+)的?/;
    // 导致...的关系
    const causesPattern = /(.+)导致(.+)的?/;

    const patterns = [
      { regex: isPattern, type: this.relationTypes.IS_A },
      { regex: containsPattern, type: this.relationTypes.PART_OF },
      { regex: belongsPattern, type: this.relationTypes.BELONGS_TO },
      { regex: causesPattern, type: this.relationTypes.CAUSES }
    ];

    patterns.forEach(pattern => {
      const match = sentence.match(pattern.regex);
      if (match) {
        const [, source, target] = match;
        if (source && target) {
          const relationKey = `${source}-${target}`;
          relations.set(relationKey, {
            source: source.trim(),
            target: target.trim(),
            type: pattern.type
          });
        }
      }
    });
  }

  // 获取关系标签
  getRelationLabel(type) {
    const labels = {
      [this.relationTypes.IS_A]: '是',
      [this.relationTypes.PART_OF]: '包含',
      [this.relationTypes.HAS_PROPERTY]: '具有',
      [this.relationTypes.RELATED_TO]: '相关',
      [this.relationTypes.CAUSES]: '导致',
      [this.relationTypes.BELONGS_TO]: '属于'
    };
    return labels[type] || '关联';
  }

  // 生成唯一ID
  generateId(text) {
    return `node-${text.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 计算节点重要性
  calculateNodeImportance(nodes, edges) {
    const degrees = new Map();
    
    // 计算度数
    edges.forEach(edge => {
      degrees.set(edge.data.source, (degrees.get(edge.data.source) || 0) + 1);
      degrees.set(edge.data.target, (degrees.get(edge.data.target) || 0) + 1);
    });

    // 更新节点大小
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        size: Math.max(30, Math.min(80, (degrees.get(node.data.id) || 0) * 10))
      }
    }));
  }

  // 聚类分析
  performClustering(nodes, edges) {
    // 实现社区发现算法
    // 这里使用简单的度数聚类作为示例
    const clusters = new Map();
    
    nodes.forEach(node => {
      const degree = edges.filter(e => 
        e.data.source === node.data.id || e.data.target === node.data.id
      ).length;

      const clusterIndex = Math.floor(degree / 5); // 每5个度数为一个簇
      if (!clusters.has(clusterIndex)) {
        clusters.set(clusterIndex, []);
      }
      clusters.get(clusterIndex).push(node);
    });

    return clusters;
  }

  // 路径分析
  findShortestPath(nodes, edges, startId, endId) {
    const graph = new Map();
    
    // 构建邻接表
    edges.forEach(edge => {
      if (!graph.has(edge.data.source)) {
        graph.set(edge.data.source, []);
      }
      if (!graph.has(edge.data.target)) {
        graph.set(edge.data.target, []);
      }
      graph.get(edge.data.source).push(edge.data.target);
      graph.get(edge.data.target).push(edge.data.source);
    });

    // BFS查找最短路径
    const queue = [[startId]];
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endId) {
        return path;
      }

      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = graph.get(node) || [];
        
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push([...path, neighbor]);
          }
        }
      }
    }

    return null; // 没有找到路径
  }
} 